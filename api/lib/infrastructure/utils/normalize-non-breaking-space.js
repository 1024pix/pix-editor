export function normalizeNonBreakingSpace(str) {
  return str
    .replaceAll(/ ?([€$%])/g, ' $1')
    .replaceAll(/ ?(°C)/g, ' $1')
    .replaceAll(/ ([;?!])/g, ' $1');
}
