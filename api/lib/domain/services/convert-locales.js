import { LOCALE_TO_LANGUAGE_MAP } from '../constants.js';
import _ from 'lodash';

export function convertLanguagesToLocales(languages) {
  return languages.map((language) => convertLanguageToLocale(language));
}

export function convertLanguageToLocale(language) {
  const locale = _.findKey(LOCALE_TO_LANGUAGE_MAP, (lang) => language === lang);
  if (!locale) {
    throw new Error('Langue inconnue');
  }
  return locale;
}

export function convertLocalesToLanguages(locales) {
  return locales.map((locale) => convertLocaleToLanguage(locale));
}

export function convertLocaleToLanguage(locale) {
  const language = LOCALE_TO_LANGUAGE_MAP[locale];
  if (!language) {
    throw new Error('Locale inconnue');
  }
  return language;
}
