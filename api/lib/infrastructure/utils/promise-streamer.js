import * as Sentry from '@sentry/node';
import { logger } from '../logger.js';
import { PassThrough } from 'node:stream';
import * as config from '../../config.js';

function getWritableStream() {
  const writableStream = new PassThrough();
  writableStream.headers = {
    'content-type': 'application/json',

    // WHY: to avoid compression because when compressing, the server buffers
    // for too long causing a response timeout.
    'content-encoding': 'identity',
  };
  return writableStream;
}

export function promiseStreamer(promise, writableStream = getWritableStream()) {
  const multiply = function(arr, numb) {
    const res = [];
    for (let i = 0; i < numb; ++i) {
      res.push(...structuredClone(arr));
    }
    return res;
  };
  const timer = setInterval(() => {
    writableStream.write('\n');
  }, 1000);
  promise.then((data) => {
    clearInterval(timer);
    writableStream.write('{');
    const keys = Object.keys(data);
    while (keys.length > 0) {
      const key = keys.shift();
      const multiplier = ['challenges', 'translations'].includes(key) ? config.mon_debug.multiplyAfter : 1;
      const dataMult = multiply(data[key], multiplier);
      writableStream.write('"' + key + '":' + JSON.stringify(dataMult));
      if (keys.length !== 0) {
        writableStream.write(',');
      }
    }
    writableStream.write('}');
  }).catch((error) => {
    logger.error(error);
    Sentry.captureException(error);
    writableStream.write('error');
  }).finally(() => {
    clearInterval(timer);
    writableStream.end();
  });
  return writableStream;
}
