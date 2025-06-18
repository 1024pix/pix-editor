import { helper } from '@ember/component/helper';

const flagsForLanguages = {
  fr: '🇫🇷',
  'fr-fr': '🇫🇷',
  en: '🇬🇧',
  es: '🇪🇸',
  nl: '🇳🇱',
};

export function flagForLanguage([language]) {
  return flagsForLanguages?.[language] ?? '';
}

export default helper(flagForLanguage);
