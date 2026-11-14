import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import taTranslation from './locales/ta.json';

const savedLang = localStorage.getItem('nilam_pesum_lang') || 'ta';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ta: {
        translation: taTranslation
      },
      en: {
        translation: enTranslation
      }
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
