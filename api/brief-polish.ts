import { GoogleGenerativeAI } from '@google/generative-ai';

const DEVANAGARI_DIGITS = '०१२३४५६७८९';

function normalizeDigits(text: string): string {
  return text.replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)));
}

function extractNumbers(text: string): string[] {
  return normalizeDigits(text).match(/\d+(?:\.\d+)?/g) ?? [];
}

function passesNumericGuard(polished: string, facts: string): boolean {
  const allowed = new Set(extractNumbers(facts));
  return extractNumbers(polished).every((n) => allowed.has(n));
}

function sendJson(res: any, status: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Sliding window rate-limiter: 14 requests / min per IP
const rateLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 14;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
  }

  // Rate limiting
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '127.0.0.1';
  const now = Date.now();
  const timestamps = (rateLimits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return sendJson(res, 429, {
      error: 'Rate limit reached (capped at 14 requests/min). Please wait a moment.',
    });
  }
  timestamps.push(now);
  rateLimits.set(ip, timestamps);

  const { facts, language = 'hi' } = req.body || {};
  if (!facts || typeof facts !== 'string') {
    return sendJson(res, 400, { error: 'Missing "facts" string in request body.' });
  }

  // Only Hindi briefs require the conversational style guide rewrite
  if (language !== 'hi') {
    return sendJson(res, 200, { polished: facts, usedAi: false });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return original facts if no Gemini API key configured
    return sendJson(res, 200, {
      polished: facts,
      usedAi: false,
      warning: 'API key not configured; returned original text.',
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const systemPrompt = `You are a clinical communication specialist for Cyculus, an on-device cycle diary.
Your task is to polish factual clinical summaries into warm, natural, conversational Hindustani (written in Devanagari script).

HINDI STYLE GUIDE RULES:
1. Address the user with "आप" in a friendly, gentle, non-judgmental tone.
2. Write short, crisp, active sentences (one thought per sentence).
3. Use common everyday loanwords written in Devanagari:
   - पीरियड (never 'माहवारी' or 'मासिक धर्म')
   - डॉक्टर (never 'चिकित्सक' or 'वैद्य')
   - फ्लो (never 'रक्तस्राव')
   - क्रैम्प्स (never 'ऐंठन' or 'कष्टार्तव')
   - गैप (never 'अंतराल' or 'कालावधि')
   - सेव करें (never 'सुरक्षित करें' or 'विलोपित')
   - लॉग / एंट्री (never 'प्रविष्टि')
   - नॉर्मल (never 'सामान्य सीमा')
   - डेटा (never 'आंकड़े')
4. ALWAYS use standard Arabic digits (0, 1, 2, 3, 4, 5, 6, 7, 8, 9). Never use Devanagari numerals (२९) or spelled-out words (पैंतीस).
5. STRICTLY AVOID bureaucratic / stiff words:
   - DO NOT use: हेतु, तथा, द्वारा, अतः, प्रदर्शित, समस्त, विलोपित, कष्टार्तव, रक्तस्राव, अंशांकित.
   - Use instead: के लिए, और, से, इसलिए, दिखेगा, सारा, मिटाएं, क्रैम्प्स, ब्लीडिंग, अंदाज़ा.
6. ABSOLUTE ZERO NUMERIC DRIFT:
   - You must NEVER invent, alter, add, or drop ANY number, quantity, date, or threshold.
   - Every single number in your output must match a number from the input facts.

FEW-SHOT EXAMPLES:

Example 1 (Flag explanation):
Facts: "आपके चक्र की अवधि सामान्य सीमा से बाहर पाई गई है। 3 चक्रों का विश्लेषण किया गया।"
Polished: "आपके पीरियड्स के बीच का गैप आमतौर पर माने जाने वाले दायरे से ज़्यादा है। पिछले 3 पीरियड्स के हिसाब से एक बार डॉक्टर से बात कर लेना अच्छा रहेगा।"

Example 2 (Evidence line):
Facts: "पिछले 5 चक्रों में से 3 की अवधि 35 दिनों से अधिक थी।"
Polished: "पिछले 5 में से 3 बार पीरियड 35 दिन से ज़्यादा के गैप पर आए।"

Example 3 (Symptoms & Pain):
Facts: "रक्तस्राव की अवधि 4 दिन रही और ऐंठन का स्तर 8/10 रहा।"
Polished: "पीरियड में 4 दिन ब्लीडिंग रही और क्रैम्प्स का दर्द 8/10 तक पहुंचा।"

Example 4 (Summary line):
Facts: "3 पूरे चक्र, औसत चक्र लंबाई 29 दिन। 1 बिंदु डॉक्टर से चर्चा के लायक हैं।"
Polished: "पिछले 3 पूरे पीरियड्स के हिसाब से, आपका औसत गैप 29 दिन रहा है। 1 बात ऐसी है जिस पर डॉक्टर से बात कर लेना अच्छा रहेगा।"
`;

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.1,
      },
    });

    const prompt = `Facts to polish in natural conversational Hindi:\n"""${facts}"""\n\nReturn ONLY the polished text with ZERO extra explanations or quotes:`;
    const result = await model.generateContent(prompt);
    const candidate = result.response.text().trim();

    // Enforce Numeric Guard before sending response
    if (passesNumericGuard(candidate, facts)) {
      return sendJson(res, 200, {
        polished: candidate,
        usedAi: true,
      });
    } else {
      console.warn('[NumericGuard] Server rejected candidate due to numeric drift:', {
        candidate,
        facts,
      });
      return sendJson(res, 200, {
        polished: facts,
        usedAi: false,
        warning: 'AI output rejected by numeric guard; preserved original facts.',
      });
    }
  } catch (error: any) {
    return sendJson(res, 200, {
      polished: facts,
      usedAi: false,
      error: error?.message || 'Gemini polish error; preserved facts.',
    });
  }
}
