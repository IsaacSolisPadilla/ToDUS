import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from "expo-localization";

import en from './locales/en.json';
import es from './locales/es.json';

// Obtengo el código de idioma principal, p.ej. "en" de "en-US"
const localeCode = Localization.locale.split('-')[0];
// Si no está en ['en','es'], uso 'es' por defecto
const languageTag = ['en', 'es'].includes(localeCode) ? localeCode : 'es';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: languageTag,
    fallbackLng: 'es',
    resources: { en: { translation: en }, es: { translation: es } },
    interpolation: { escapeValue: false },
  });

export default i18n;
