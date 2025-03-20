import { en } from './en';
import { ja } from './ja';

export const locales = {
  en,
  ja,
};

export type LocaleKey = keyof typeof locales;
export type LocaleStrings = typeof en;
