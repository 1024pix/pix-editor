export function areLocalesEqual(locale1, locale2) {
  return Intl.getCanonicalLocales(locale1)[0] === Intl.getCanonicalLocales(locale2)[0];
}
