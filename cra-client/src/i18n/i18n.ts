import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
const translationEN = require('./locales/en.json');
const translationES = require('./locales/es.json');

// the translations
export const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  }
};

i18n
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    lng: 'es', // default language
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
