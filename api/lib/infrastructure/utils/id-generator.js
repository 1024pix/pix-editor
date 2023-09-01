import random from 'js-crypto-random';
import basex from 'base-x';

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62_encode = basex(BASE62).encode;

// TODO : put code in one place
// duplicated in front side
export function generateNewId(prefix) {
  const randomString = random.getRandomAsciiString(10);
  const buf = new TextEncoder('utf-8').encode(randomString);
  const randomBase62 = base62_encode(buf);
  return `${prefix}${randomBase62}`;
}
