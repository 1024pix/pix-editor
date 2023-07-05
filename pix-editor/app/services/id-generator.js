import Service from '@ember/service';
import random from 'js-crypto-random';
import basex from 'base-x';

// TODO : put code in one place
// duplicated in api side
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62_encode = basex(BASE62).encode;

const RECORD_ID_PREFIX = 'rec';

export default class IdGeneratorService extends Service {
  newId(prefix = RECORD_ID_PREFIX) {
    const randomString = random.getRandomAsciiString(10);
    const buf = new TextEncoder('utf-8').encode(randomString);
    const randomBase62 = base62_encode(buf);
    return `${prefix}${randomBase62}`;
  }
}
