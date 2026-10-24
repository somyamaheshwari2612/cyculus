import { FlowLevel, Symptom, Mood } from './types';

export const FLOW_LABELS: Record<FlowLevel, { en: string; hi: string; color: string; icon: string }> = {
  none: { en: 'None', hi: 'कोई नहीं', color: '#CBD5E1', icon: '⚪' },
  spotting: { en: 'Spotting', hi: 'स्पॉटिंग', color: '#F9A8D4', icon: '🌸' },
  light: { en: 'Light', hi: 'हल्का', color: '#F472B6', icon: '💧' },
  medium: { en: 'Medium', hi: 'मध्यम', color: '#E11D48', icon: '🩸' },
  heavy: { en: 'Heavy', hi: 'भारी', color: '#9F1239', icon: '🌊' }
};

export const SYMPTOM_LABELS: Record<Symptom, { en: string; hi: string; emoji: string }> = {
  cramps: { en: 'Cramps', hi: 'ऐंठन / क्रैम्प्स', emoji: '⚡' },
  lower_back_pain: { en: 'Lower Back Pain', hi: 'कमर दर्द', emoji: '🦴' },
  pelvic_pain: { en: 'Pelvic Pain', hi: 'पेल्विक दर्द', emoji: '🩺' },
  headache: { en: 'Headache', hi: 'सिर दर्द', emoji: '🤕' },
  nausea: { en: 'Nausea', hi: 'मतली / जी घबराना', emoji: '🤢' },
  bloating: { en: 'Bloating', hi: 'पेट फूलना', emoji: '🎈' },
  breast_tenderness: { en: 'Breast Tenderness', hi: 'स्तनों में दर्द', emoji: '🎀' },
  fatigue: { en: 'Fatigue', hi: 'थकान / सुस्ती', emoji: '🥱' },
  acne: { en: 'Acne', hi: 'मुंहासे', emoji: '✨' },
  dizziness: { en: 'Dizziness', hi: 'चक्कर आना', emoji: '💫' },
  blood_clots: { en: 'Blood Clots', hi: 'खून के थक्के', emoji: '🩸' },
  discharge_change: { en: 'Discharge Change', hi: 'स्राव में बदलाव', emoji: '💧' },
  sleep_trouble: { en: 'Sleep Trouble', hi: 'नींद की समस्या', emoji: '🌙' },
  cravings: { en: 'Food Cravings', hi: 'क्रेविंग्स', emoji: '🍫' },
  diarrhea: { en: 'Diarrhea', hi: 'दस्त', emoji: '🚽' },
  constipation: { en: 'Constipation', hi: 'कब्ज', emoji: '⏳' },
  leg_pain: { en: 'Leg Pain', hi: 'पैरों में दर्द', emoji: '🦵' }
};

export const MOOD_LABELS: Record<Mood, { en: string; hi: string; emoji: string }> = {
  calm: { en: 'Calm', hi: 'शांत', emoji: '🧘‍♀️' },
  happy: { en: 'Happy', hi: 'खुश', emoji: '😊' },
  anxious: { en: 'Anxious', hi: 'घबराहट / चिंता', emoji: '😰' },
  irritable: { en: 'Irritable', hi: 'चिड़चिड़ा', emoji: '😤' },
  low: { en: 'Low / Down', hi: 'उदास / लो', emoji: '😔' },
  mood_swings: { en: 'Mood Swings', hi: 'मूड बदलना', emoji: '🎭' }
};
