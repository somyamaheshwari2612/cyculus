import { FlowLevel, Symptom, Mood } from './types';

export const FLOW_LABELS: Record<FlowLevel, { en: string; hi: string; color: string; icon: string }> = {
  none: { en: 'None', hi: 'नहीं', color: '#CBD5E1', icon: '⚪' },
  spotting: { en: 'Spotting', hi: 'स्पॉटिंग', color: '#F9A8D4', icon: '🌸' },
  light: { en: 'Light', hi: 'हल्का', color: '#F472B6', icon: '💧' },
  medium: { en: 'Medium', hi: 'मीडियम', color: '#E11D48', icon: '🩸' },
  heavy: { en: 'Heavy', hi: 'भारी', color: '#9F1239', icon: '🌊' }
};

export const SYMPTOM_LABELS: Record<Symptom, { en: string; hi: string; emoji: string }> = {
  cramps: { en: 'Cramps', hi: 'क्रैम्प्स / पेट दर्द', emoji: '⚡' },
  lower_back_pain: { en: 'Lower Back Pain', hi: 'कमर दर्द', emoji: '🦴' },
  pelvic_pain: { en: 'Pelvic Pain', hi: 'पेल्विक दर्द', emoji: '🩺' },
  headache: { en: 'Headache', hi: 'सिर दर्द', emoji: '🤕' },
  nausea: { en: 'Nausea', hi: 'जी मिचलाना', emoji: '🤢' },
  bloating: { en: 'Bloating', hi: 'पेट फूलना', emoji: '🎈' },
  breast_tenderness: { en: 'Breast Tenderness', hi: 'स्तनों में भारीपन', emoji: '🎀' },
  fatigue: { en: 'Fatigue', hi: 'थकान', emoji: '🥱' },
  acne: { en: 'Acne', hi: 'मुंहासे', emoji: '✨' },
  dizziness: { en: 'Dizziness', hi: 'चक्कर आना', emoji: '💫' },
  blood_clots: { en: 'Blood Clots', hi: 'खून के थक्के', emoji: '🩸' },
  discharge_change: { en: 'Discharge Change', hi: 'डिस्चार्ज में बदलाव', emoji: '💧' },
  sleep_trouble: { en: 'Sleep Trouble', hi: 'नींद न आना', emoji: '🌙' },
  cravings: { en: 'Food Cravings', hi: 'क्रेविंग्स', emoji: '🍫' },
  diarrhea: { en: 'Diarrhea', hi: 'दस्त', emoji: '🚽' },
  constipation: { en: 'Constipation', hi: 'कब्ज', emoji: '⏳' },
  leg_pain: { en: 'Leg Pain', hi: 'पैरों में दर्द', emoji: '🦵' }
};

export const MOOD_LABELS: Record<Mood, { en: string; hi: string; emoji: string }> = {
  calm: { en: 'Calm', hi: 'शांत', emoji: '🧘‍♀️' },
  happy: { en: 'Happy', hi: 'खुश', emoji: '😊' },
  anxious: { en: 'Anxious', hi: 'घबराहट', emoji: '😰' },
  irritable: { en: 'Irritable', hi: 'चिड़चिड़ा', emoji: '😤' },
  low: { en: 'Low / Down', hi: 'उदास / लो', emoji: '😔' },
  mood_swings: { en: 'Mood Swings', hi: 'मूड स्विंग्स', emoji: '🎭' }
};

export const BRIEF_TEXT = {
  en: {
    notEnoughData: 'Not enough data yet. Keep logging to see your cycle pattern.',
    disclaimer: 'This app is not a medical device and does not replace a doctor. It does not diagnose.',
    cycleCount: 'Cycles used',
    avgLength: 'Average cycle length',
    range: 'Shortest to longest',
    avgBleeding: 'Average bleeding days',
    latestCycle: 'Latest completed cycle',
    days: 'days',
    earlyPicture: 'This is based on only one or two cycles, so it is an early picture.',
    flagsFound: 'point(s) are worth discussing with a doctor.',
    noFlags: 'No points were flagged for discussion in this period.',
    summaryStart: 'Based on',
    completedCycles: 'completed cycle(s), your average cycle length is',
  },
  hi: {
    notEnoughData: 'अभी ज़्यादा डेटा नहीं है। रोज़ थोड़ा-बहुत लॉग करते रहिए, जल्द ही आपके पीरियड का पैटर्न यहाँ दिखने लगेगा।',
    disclaimer: 'यह ऐप कोई मेडिकल डिवाइस नहीं है और डॉक्टर की सलाह का विकल्प नहीं है। यह किसी बीमारी की जांच या इलाज नहीं करता।',
    cycleCount: 'जितने पीरियड चक्र शामिल हैं',
    avgLength: 'पीरियड्स के बीच का औसत गैप',
    range: 'सबसे कम से सबसे ज़्यादा गैप',
    avgBleeding: 'पीरियड में ब्लीडिंग के औसत दिन',
    latestCycle: 'पिछला पूरा पीरियड गैप',
    days: 'दिन',
    earlyPicture: 'यह अभी सिर्फ 1 या 2 पीरियड्स पर आधारित है, इसलिए यह शुरुआती तस्वीर है।',
    flagsFound: 'बातें ऐसी हैं जिन पर डॉक्टर से बात कर लेना अच्छा रहेगा।',
    noFlags: 'इस दौरान ऐसी कोई बात सामने नहीं आई जिस पर डॉक्टर से अलग से बात करनी पड़े।',
    summaryStart: 'पिछले',
    completedCycles: 'पूरे पीरियड्स के हिसाब से, आपका औसत गैप',
  },
} as const;
