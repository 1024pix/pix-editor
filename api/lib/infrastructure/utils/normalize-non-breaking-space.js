export function normalizeNonBreakingSpace(str) {
  if (!str) return str;

  return str
    .replaceAll(/(?<!options=\[[^\]]*)\p{Zs}(°C)/gu, ' $1')
    .replaceAll(/(?<!options=\[[^\]]*)\p{Zs}([;?!€$%])/gu, ' $1')
    .replaceAll(/(?<!options=\[[^\]]*)\p{Zs}(:)/gu, ' $1')
    .replaceAll(/(?<!options=\[[^\]]*)\p{Zs}(»)/gu, ' $1')
    .replaceAll(/(?<!options=\[[^\]]*)(«)\p{Zs}/gu, '$1 ');
}
