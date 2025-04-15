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
    logger.info(
      { event: 'lcms:debug-epipe' },
      'anti slash n');
    writableStream.write('\n');
  }, 1000);
  promise.then((data) => {
    logger.info(
      { event: 'lcms:debug-epipe' },'Start sending data into stream');
    clearInterval(timer);
    writableStream.write('{');
    const keys = Object.keys(data);
    while (keys.length > 0) {
      const key = keys.shift();
      logger.info(
        { event: 'lcms:debug-epipe' },`Streaming ${key} data`);
      logger.info(
        { event: 'lcms:debug-epipe' },`${data[key].length} items being send`);
      writableStream.write('"' + key + '":' + JSON.stringify(data[key]));
      if (keys.length !== 0) {
        logger.info(
          { event: 'lcms:debug-epipe' },'Still more keys to send');
        writableStream.write(',');
      }
    }
    logger.info(
      { event: 'lcms:debug-epipe' },'Closing json string');
    writableStream.write('}');
  }).catch((error) => {
    logger.info(
      { event: 'lcms:debug-epipe' },'An error occurred');
    logger.error(
      { event: 'lcms:debug-epipe' },error);
    Sentry.captureException(error);
    logger.info(
      { event: 'lcms:debug-epipe' },`is stream closed ? ${writableStream.closed}`);
    writableStream.write('error');
  }).finally(() => {
    clearInterval(timer);
    logger.info({ event: 'lcms:debug-epipe' },`In the finally, is stream closed ? ${writableStream.closed}`);
    writableStream.end();
    logger.info({ event: 'lcms:debug-epipe' },`In the finally after the end, is stream closed ? ${writableStream.closed}`);
  });
  return writableStream;
}
