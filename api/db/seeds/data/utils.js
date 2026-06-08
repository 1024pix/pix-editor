export function* cycle(arr) {
  if (arr.length === 0) return;
  while (true) {
    yield* arr;
  }
}

export function transformLocalesToUniqLangArray(locales) {
  const langs = locales.map((locale) => {
    return locale.split('-')[0];
  });
  return [...new Set(langs)];
}
