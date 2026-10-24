import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export const FLOW_LEVELS = ['none', 'spotting', 'light', 'medium', 'heavy'] as const;
export type FlowLevel = typeof FLOW_LEVELS[number];

export const SYMPTOMS = [
  'cramps', 'lower_back_pain', 'pelvic_pain', 'headache', 'nausea', 'bloating',
  'breast_tenderness', 'fatigue', 'acne', 'dizziness', 'blood_clots',
  'discharge_change', 'sleep_trouble', 'cravings', 'diarrhea', 'constipation', 'leg_pain'
] as const;
export type Symptom = typeof SYMPTOMS[number];

export const MOODS = ['calm', 'happy', 'anxious', 'irritable', 'low', 'mood_swings'] as const;
export type Mood = typeof MOODS[number];

export interface DayPatch {
  date: string;
  flow?: FlowLevel | null;
  painLevel?: number | null;
  symptoms?: Symptom[];
  moods?: Mood[];
  notes?: string;
}

// In-memory cache for recent identical requests (5 minute TTL)
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// Sliding window rate-limiter: capped strictly at 14 requests per minute per IP (protects free-tier quota)
const rateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 14;

function sendJson(res: any, status: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

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
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' });
  }

  // Rate Limiting (14 RPM cap)
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const timestamps = (rateLimits.get(clientIp) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return sendJson(res, 429, {
      ok: false,
      error: 'Rate limit reached (capped at 14 requests/min). Please wait a few moments before trying again.'
    });
  }
  timestamps.push(now);
  rateLimits.set(clientIp, timestamps);

  // Robust body parsing across Vercel environments
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  } else if (!body && typeof req[Symbol.asyncIterator] === 'function') {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const raw = Buffer.concat(chunks).toString('utf-8');
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = {};
    }
  }

  const { text, today, locale = 'auto' } = body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return sendJson(res, 400, { ok: false, error: 'Text query is required' });
  }

  const referenceDate = today || new Date().toISOString().split('T')[0];
  const cacheKey = `${text.trim()}_${referenceDate}_${locale}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return sendJson(res, 200, cached.data);
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
    return sendJson(res, 200, responsePayload);
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
    return sendJson(res, 200, finalResult);

  } catch (error: any) {
    console.error('Extraction error:', error);
    // Return standard failure response so client falls back to local rules/tap logger
    return sendJson(res, 200, {
      ok: false,
      error: error?.message || 'Gemini extraction encountered an error.',
      redFlags: deterministicRedFlags,
      confidence: 0,
      warnings: ['Could not interpret with AI model. Falling back to local logger.']
    });
  }
}
