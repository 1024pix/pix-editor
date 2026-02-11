import { helper } from '@ember/component/helper';

const flagsForLanguages = {
  'de-AT': '🇦🇹',
  fr: '🇫🇷',
  'fr-fr': '🇫🇷',
  'fr-BE': '🇧🇪',
  en: '🇬🇧',
  es: '🇪🇸',
  'es-419': '🌎',
  it: '🇮🇹',
  nl: '🇳🇱',
};

export function flagForLanguage([language]) {
  return flagsForLanguages?.[language] ?? '';
}

export default helper(flagForLanguage);
