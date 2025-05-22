export function normalizeNonBreakingSpace(str) {
  if (!str) return str;
  return str
    .replaceAll(/\p{Zs}(°C)/gu, ' $1')
    .replaceAll(/\p{Zs}([;?!€$%])/gu, ' $1')
    .replaceAll(/\p{Zs}(:)/gu, ' $1')
    .replaceAll(/\p{Zs}(»)/gu, ' $1')
    .replaceAll(/(«)\p{Zs}/gu, '$1 ');
}
