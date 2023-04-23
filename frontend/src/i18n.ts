import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';

import fi from './locales/fi.json';
import en from './locales/en.json';
import se from './locales/se.json';

export const resources = {
  fi: {
    language: 'fi',
    translation: fi,
  },
  en: {
    language: 'en',
    translation: en,
  },
  se: {
    language: 'se',
    translation: se,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fi',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  });

export default i18n;
