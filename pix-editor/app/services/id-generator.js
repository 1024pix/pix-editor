import Service from '@ember/service';
import random from 'js-crypto-random';
import { base62_encode } from '@samwen/base62-util';
const RECORD_ID_PREFIX = 'rec';


export default class IdGeneratorService extends Service {
  newId() {
    const randomString = random.getRandomAsciiString(10);
    const randomBase62 = base62_encode(randomString);
    return `${RECORD_ID_PREFIX}${randomBase62}`;
  }
}
