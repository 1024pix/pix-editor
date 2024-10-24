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
    writableStream.write(JSON.stringify(data));
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
