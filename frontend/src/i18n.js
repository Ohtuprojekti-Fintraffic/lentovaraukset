import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';

import fi from './locales/fi.json';

export const resources = {
  fi: {
    language: 'fi',
    translation: fi,
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
  });

export default i18n;
