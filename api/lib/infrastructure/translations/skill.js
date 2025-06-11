import { buildTranslationsUtils } from './utils.js';

export const prefix = 'skill.';

const locales = [
  { locale: 'fr' },
  { locale: 'en' },
];

const fields = [
  { field: 'hint' },
];

export const {
  extractFromReleaseObject,
  extractFromDomainObject,
  toDomain,
} = buildTranslationsUtils({ locales, fields, prefix });
