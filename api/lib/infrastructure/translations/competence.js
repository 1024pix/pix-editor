import { buildTranslationsUtils } from './utils.js';

export const prefix = 'competence.';

const locales = [{ locale: 'fr' }, { locale: 'en' }];

const fields = [{ field: 'name' }, { field: 'description' }];

export const { toDomain, extractFromDomainObject, extractFromReleaseObject } = buildTranslationsUtils({
  locales,
  fields,
  prefix,
});
