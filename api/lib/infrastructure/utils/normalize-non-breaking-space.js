export function normalizeNonBreakingSpace(str) {
  return str.replaceAll(/ ([;?!])/g, ' $1');
}
