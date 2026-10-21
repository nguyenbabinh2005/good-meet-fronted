import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { vi } from './locales/vi'

void i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  fallbackLng: 'en',
  supportedLngs: ['vi', 'en'],
  interpolation: { escapeValue: false },
  detection: {
    order: ['localStorage'],
    caches: ['localStorage'],
    lookupLocalStorage: 'good-meet-language',
  },
})

export default i18n
