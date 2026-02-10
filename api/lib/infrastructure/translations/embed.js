import { Translation } from '../../domain/models/index.js';

export function i18nextToTranslations(translations, locale) {
  return extractI18nextKeyValues(translations, 'embed')
    .map(({ key, value }) => new Translation({ key, locale, value }));
}

function extractI18nextKeyValues(value, path) {
  if (typeof value === 'string') return [{ key: path, value }];

  if (Array.isArray(value)) {
    return value.flatMap((child, index) => extractI18nextKeyValues(child, `${path}[${index}]`));
  }

  return Object.entries(value).flatMap(([key, child]) => extractI18nextKeyValues(child, `${path}.${key}`));
}
