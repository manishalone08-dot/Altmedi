import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import mr from './locales/mr.json';
import hi from './locales/hi.json';

export const defaultNS = 'translation';
export const resources = {
  en: { translation: en },
  mr: { translation: mr },
  hi: { translation: hi }
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'mr', 'hi'],
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'altmedi_language',
      caches: ['localStorage']
    }
  });

export default i18n;
