import * as Sentry from '@sentry/node';
import { logger } from '../logger.js';
import { PassThrough } from 'node:stream';

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
  const timer = setInterval(() => {
    writableStream.write('\n');
  }, 1000);
  promise.then((data) => {
    clearInterval(timer);
    writableStream.write('{');
    const keys = Object.keys(data);
    while (keys.length > 0) {
      const key = keys.shift();
      writableStream.write('"' + key + '":' + JSON.stringify(data[key]));
      if (keys.length !== 0) {
        writableStream.write(',');
      }
    }
    writableStream.write('}');
  }).catch((error) => {
    logger.error(error);
    Sentry.captureException(error);
    if (!writableStream.closed) {
      writableStream.write('error');
    }
  }).finally(() => {
    clearInterval(timer);
    if (!writableStream.closed) {
      writableStream.end();
    }
  });
  return writableStream;
}
