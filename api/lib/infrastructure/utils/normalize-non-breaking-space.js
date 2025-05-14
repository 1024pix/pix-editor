export function normalizeNonBreakingSpace(str) {
  if (!str) return str;
  return str
    .replaceAll(/ ?(°C)/g, ' $1')
    .replaceAll(/ ([;?!€$%])/g, ' $1')
    .replaceAll(/ (:)/g, ' $1')
    .replaceAll(/ ?(»)/g, ' $1')
    .replaceAll(/(«) ?/g, '$1 ');
}
