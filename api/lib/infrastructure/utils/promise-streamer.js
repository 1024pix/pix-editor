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
    logger.info('Start sending data into stream');
    clearInterval(timer);
    writableStream.write('{');
    const keys = Object.keys(data);
    while (keys.length > 0) {
      const key = keys.shift();
      logger.info(`Streaming ${key} data`);
      logger.info(`${data[key].length} items being send`);
      writableStream.write('"' + key + '":' + JSON.stringify(data[key]));
      if (keys.length !== 0) {
        logger.info('Still more keys to send');
        writableStream.write(',');
      }
    }
    logger.info('Closing json string');
    writableStream.write('}');
  }).catch((error) => {
    logger.info('An error occurred');
    logger.error(error);
    Sentry.captureException(error);
    logger.info(`is stream closed ? ${writableStream.closed}`);
    writableStream.write('error');
  }).finally(() => {
    clearInterval(timer);
    logger.info(`In the finally, is stream closed ? ${writableStream.closed}`);
    writableStream.end();
  });
  return writableStream;
}
