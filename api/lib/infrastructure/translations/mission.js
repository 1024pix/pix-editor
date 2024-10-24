import { buildTranslationsUtils } from './utils.js';

export const prefix = 'mission.';

const locales = [
  { locale: 'fr' },
];

const fields = [
  { field: 'name' },
  { field: 'learningObjectives' },
  { field: 'validatedObjectives' },
  { field: 'introductionMediaAlt' },
];

export const {
  toDomain,
  extractFromReleaseObject,
} = buildTranslationsUtils({ locales, fields, prefix });
