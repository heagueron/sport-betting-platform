import { es } from './es';
import { en } from './en';

export const translations = {
  es,
  en,
};

export type Language = 'es' | 'en';
export type TranslationKey = keyof typeof es;

export const defaultLanguage: Language = 'es';
