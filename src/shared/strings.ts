import { STRINGS_HI } from './strings.hi';
import { STRINGS_EN } from './strings.en';

export { STRINGS_HI } from './strings.hi';
export { STRINGS_EN } from './strings.en';

export type TranslationStrings = typeof STRINGS_EN;

export const STRINGS: Record<'en' | 'hi', TranslationStrings> = {
  en: STRINGS_EN,
  hi: STRINGS_HI as unknown as TranslationStrings,
};

export function getStrings(lang: 'en' | 'hi' = 'en'): TranslationStrings {
  return STRINGS[lang] || STRINGS.en;
}
