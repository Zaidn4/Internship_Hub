import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en/translation.json'
import fr from './locales/fr/translation.json'

i18n
  .use(LanguageDetector)       // Detects language from browser / localStorage
  .use(initReactI18next)       // Passes i18n instance to react-i18next
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    fallbackLng: 'en',          // Fall back to English if detection fails
    supportedLngs: ['en', 'fr'],
    interpolation: {
      escapeValue: false,       // React already escapes values
    },
    detection: {
      // Lookup order: localStorage → navigator language
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

export default i18n
