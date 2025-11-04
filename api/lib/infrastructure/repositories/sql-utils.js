export function escapeLikeWildcards(str) {
  return str.replace(/([_%])/g, '\\$1');
}
