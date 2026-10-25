import { passesNumericGuard } from './numericGuard';

/**
 * System prompt containing the Hindi Style Guide & few-shot examples for Gemini.
 */
export const BRIEF_POLISH_SYSTEM_PROMPT = `You are a clinical communication specialist for Cyculus, an on-device cycle diary.
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

export interface PolishResult {
  polished: string;
  passedGuard: boolean;
  usedAi: boolean;
  error?: string;
}

/**
 * Polish a factual brief summary using Gemini, validated by passesNumericGuard.
 * Falls back safely to factsText if offline, no API key, or numeric guard rejects.
 */
export async function polishBriefText(
  factsText: string,
  language: 'en' | 'hi'
): Promise<PolishResult> {
  // If not Hindi, or facts are empty, return facts directly
  if (language !== 'hi' || !factsText.trim()) {
    return {
      polished: factsText,
      passedGuard: true,
      usedAi: false,
    };
  }

  try {
    const res = await fetch('/api/brief-polish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facts: factsText, language }),
    });

    if (!res.ok) {
      return {
        polished: factsText,
        passedGuard: true,
        usedAi: false,
        error: `Server status ${res.status}`,
      };
    }

    const data = await res.json();
    const candidate = data.polished || factsText;

    // Strict client-side numeric guard check
    if (passesNumericGuard(candidate, factsText)) {
      return {
        polished: candidate,
        passedGuard: true,
        usedAi: Boolean(data.usedAi),
      };
    } else {
      console.warn('[NumericGuard] Rejected AI polished text due to numeric discrepancy:', {
        candidate,
        factsText,
      });
      return {
        polished: factsText,
        passedGuard: false,
        usedAi: false,
        error: 'Rejected by numeric guard whitelist',
      };
    }
  } catch (err: any) {
    // Offline or network error: gracefully keep original facts
    return {
      polished: factsText,
      passedGuard: true,
      usedAi: false,
      error: err?.message || 'Network error',
    };
  }
}
