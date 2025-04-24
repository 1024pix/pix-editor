export function normalizeNonBreakingSpace(str) {
  return str
    .replaceAll(/ ?(°C)/g, ' $1')
    .replaceAll(/ ([;?!€$%])/g, ' $1');
}
