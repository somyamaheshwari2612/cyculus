import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { FLOW_LEVELS, SYMPTOMS, MOODS, DayPatch, FlowLevel, Symptom, Mood } from '../src/shared/types';

// In-memory cache for recent identical requests (5 minute TTL)
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// Simple sliding window rate-limiter: max 30 requests per minute per IP
const rateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

// Deterministic keyword / regex backup for urgent red-flag detection
const URGENT_RULES = {
  urgent_heavy_bleeding: [
    /soak(ing)?\s+(a\s+)?(pad|tampon)\s+(every|each|\/)\s*(hour|hr|40\s*min|30\s*min)/i,
    /pad\s*(har|ek)\s*ghante\s*badal/i,
    /khoon\s*rukk\s*nahi\s*raha/i,
    /bahut\s*zyada\s*blood|heavy\s*clots|large\s*clots/i,
    /soak(ed)?\s*through\s*(clothes|bed|sheets)/i
  ],
  urgent_severe_pain: [
    /unbearable\s*pain|excruciating|incapacitating|severe\s*cramps/i,
    /asahay\s*dard|bardasht\s*nahi\s*ho\s*raha|bura\s*dard|chhati\s*phat/i,
    /screaming\s*in\s*pain|can't\s*walk|can't\s*stand/i
  ],
  urgent_fainting: [
    /faint(ed|ing)?|passed\s*out|collapse(d)?|blacked\s*out|syncope/i,
    /behosh|chakkar\s*aake\s*gir|aankhon\s*ke\s*aage\s*andhera/i
  ]
};

function detectDeterministicRedFlags(text: string): string[] {
  const flags = new Set<string>();
  for (const [flagId, regexList] of Object.entries(URGENT_RULES)) {
    for (const regex of regexList) {
      if (regex.test(text)) {
        flags.add(flagId);
        break;
      }
    }
  }
  return Array.from(flags);
}

// Serverless handler for Vercel / Node
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  // Rate Limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const timestamps = (rateLimits.get(clientIp) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      ok: false,
      error: 'Too many requests. Please wait a moment before trying again.'
    });
  }
  timestamps.push(now);
  rateLimits.set(clientIp, timestamps);

  const { text, today, locale = 'auto' } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ ok: false, error: 'Text query is required' });
  }

  const referenceDate = today || new Date().toISOString().split('T')[0];
  const cacheKey = `${text.trim()}_${referenceDate}_${locale}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return res.status(200).json(cached.data);
  }

  // Deterministic urgent red flag check
  const deterministicRedFlags = detectDeterministicRedFlags(text);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Graceful offline/no-key deterministic extraction fallback
    const fallbackPatches: DayPatch[] = [
      {
        date: referenceDate,
        flow: /heavy|zyada|bohot flow/i.test(text) ? 'heavy' : /spotting/i.test(text) ? 'spotting' : null,
        painLevel: /bohot dard|severe/i.test(text) ? 8 : /dard|pain/i.test(text) ? 5 : null,
        symptoms: (/pet dard|cramps/i.test(text) ? ['cramps'] : []).concat(/kamar dard|back pain/i.test(text) ? ['lower_back_pain'] : []) as Symptom[],
        moods: /mood off|low|sad/i.test(text) ? ['low'] : [],
        notes: text.trim()
      }
    ];

    const responsePayload = {
      ok: true,
      patches: fallbackPatches,
      redFlags: deterministicRedFlags,
      confidence: 0.7,
      warnings: ['Processed with local rule fallback (API key not configured).']
    };
    return res.status(200).json(responsePayload);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const systemInstruction = `You are a clinical schema extraction engine for Cyculus, an offline-first menstrual cycle diary.
Your task is to extract structured health tracking logs from everyday natural language (English, Hindi, or Hinglish).
The reference date (today) is: "${referenceDate}".

Hinglish & Hindi Clinical Vocabulary:
- "pet dard", "pet mein ainthana" -> symptom: "cramps" or "pelvic_pain"
- "kamar dard", "peeth dard" -> symptom: "lower_back_pain"
- "sir dard" -> symptom: "headache"
- "ulti jaisa", "matli" -> symptom: "nausea"
- "pet phoolna", "gas" -> symptom: "bloating"
- "thakaan", "kamzori" -> symptom: "fatigue"
- "chakkar", "sir ghumna" -> symptom: "dizziness"
- "khoon ke thakke" -> symptom: "blood_clots"
- "mood off", "udaas" -> mood: "low"
- "chidhchidhapan" -> mood: "irritable"
- "ghabrahat" -> mood: "anxious"
- "flow zyada", "bohot khoon" -> flow: "heavy"
- "flow kam" -> flow: "light"
- "spotting" -> flow: "spotting"
- "normal bleeding" -> flow: "medium"

Date Resolution Rules:
- "kal", "yesterday" -> 1 day before today
- "parso", "day before yesterday" -> 2 days before today
- "kal se" / "since yesterday" -> emit patches for BOTH yesterday and today
- "aaj", "today" -> today (${referenceDate})
- Format all dates strictly as YYYY-MM-DD.

Urgent Red Flags:
If the user describes soaking a pad every hour, large blood clots, fainting, or acute severe incapacitating pain, include "urgent_heavy_bleeding", "urgent_severe_pain", or "urgent_fainting" in redFlags.
Never diagnose. Only extract facts.`;

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            patches: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  date: { type: SchemaType.STRING, description: 'YYYY-MM-DD format' },
                  flow: {
                    type: SchemaType.STRING,
                    format: 'enum',
                    enum: [...FLOW_LEVELS],
                    nullable: true
                  },
                  painLevel: {
                    type: SchemaType.INTEGER,
                    description: '0 to 10 pain rating',
                    nullable: true
                  },
                  symptoms: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.STRING,
                      format: 'enum',
                      enum: [...SYMPTOMS]
                    }
                  },
                  moods: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.STRING,
                      format: 'enum',
                      enum: [...MOODS]
                    }
                  },
                  notes: { type: SchemaType.STRING }
                },
                required: ['date']
              }
            },
            redFlags: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            },
            confidence: { type: SchemaType.NUMBER }
          },
          required: ['patches']
        }
      }
    });

    const result = await model.generateContent(`User input: "${text}"`);
    const rawResponse = result.response.text();
    const parsed = JSON.parse(rawResponse);

    // Schema validation and enum sanitization
    const validFlows = new Set(FLOW_LEVELS);
    const validSymptoms = new Set(SYMPTOMS);
    const validMoods = new Set(MOODS);

    const validatedPatches: DayPatch[] = (parsed.patches || []).map((p: any) => {
      const sanitizedSymptoms = (p.symptoms || []).filter((s: string) => validSymptoms.has(s as Symptom));
      const sanitizedMoods = (p.moods || []).filter((m: string) => validMoods.has(m as Mood));
      const sanitizedFlow = validFlows.has(p.flow) ? (p.flow as FlowLevel) : null;
      let sanitizedPain = typeof p.painLevel === 'number' ? Math.max(0, Math.min(10, Math.round(p.painLevel))) : null;

      return {
        date: p.date || referenceDate,
        flow: sanitizedFlow,
        painLevel: sanitizedPain,
        symptoms: sanitizedSymptoms,
        moods: sanitizedMoods,
        notes: typeof p.notes === 'string' ? p.notes : ''
      };
    });

    // Combine model red flags with deterministic regex backup
    const combinedRedFlags = Array.from(
      new Set([...(parsed.redFlags || []), ...deterministicRedFlags])
    ).filter(f => ['urgent_heavy_bleeding', 'urgent_severe_pain', 'urgent_fainting'].includes(f));

    const finalResult = {
      ok: true,
      patches: validatedPatches,
      redFlags: combinedRedFlags,
      confidence: parsed.confidence || 0.9,
      warnings: combinedRedFlags.length > 0 ? ['Urgent symptoms detected. Please consult emergency care.'] : []
    };

    cache.set(cacheKey, { timestamp: now, data: finalResult });
    return res.status(200).json(finalResult);

  } catch (error: any) {
    console.error('Extraction error:', error);
    // Fall back gracefully so client is never blocked
    return res.status(200).json({
      ok: true,
      patches: [
        {
          date: referenceDate,
          flow: null,
          painLevel: null,
          symptoms: [],
          moods: [],
          notes: text.trim()
        }
      ],
      redFlags: deterministicRedFlags,
      confidence: 0.5,
      warnings: ['Automatic interpretation encountered an issue. Raw text saved into notes.']
    });
  }
}
