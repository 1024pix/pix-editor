export function buildTranslation(
  {
    id,
    key,
    locale = 'de',
    value = 'nachte flut',
  } = {}) {
  return {
    id,
    'fields': {
      'key': key,
      'locale': locale,
      'value': value,
    },
  };
}
