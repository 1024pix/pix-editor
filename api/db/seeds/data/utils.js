export function* cycle(arr) {
  if (arr.length === 0) return;
  while (true) {
    yield* arr;
  }
}

export function ensureMainLocaleExists(locales) {
  if (!locales.includes('fr')) {
    locales.push('fr');
  }
  return locales;
}
