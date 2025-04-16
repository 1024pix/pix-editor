import * as Sentry from '@sentry/node';
import { logger } from '../logger.js';
import { PassThrough, pipeline } from 'node:stream';

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

function prefixWithDate(str) {
  return `${new Date().toISOString()} -- ${str}`;
}
export function promiseStreamerForRepli2(promise) {
  const writableStream = new PassThrough();
  writableStream.on('close', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('WritableStream event: close'));
  });
  writableStream.on('drain', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('WritableStream event: drain'));
  });
  writableStream.on('error', (error) => {
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('WritableStream event: error ' + JSON.stringify(error, undefined, 2)));
  });
  writableStream.on('finish', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('WritableStream event: finish'));
  });
  writableStream.on('pipe', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('WritableStream event: pipe'));
  });
  writableStream.on('unpipe', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('WritableStream event: unpipe'));
  });
  const timer = setInterval(() => {
    logger.info(
      { event: 'lcms:debug-epipe' },
      prefixWithDate('anti slash n '));
    writableStream.write('\n');
  }, 1000);

  promise.then((data) => {
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('Clearing interval'));
    clearInterval(timer);
    function* chunk(data, size) {
      logger.info(
        { event: 'lcms:debug-epipe' },prefixWithDate('STRINGIFYING'));
      const stringifiedData = JSON.stringify(data);
      for (let i = 0; i < stringifiedData.length; i += size) {
        logger.info(
          { event: 'lcms:debug-epipe' },prefixWithDate('NEXT'));
        yield stringifiedData.slice(i, i + size);
      }
      logger.info(
        { event: 'lcms:debug-epipe' },prefixWithDate('END'));
    }
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('Start sending data into stream'));
    pipeline(
      chunk(data, 200_000),
      writableStream,
      (err, val) => {
        if (err) {
          logger.error(
            { event: 'lcms:debug-epipe' },prefixWithDate('error dans pipeline ' + JSON.stringify(err, undefined, 2)));
          throw err;
        } else {
          logger.info(
            { event: 'lcms:debug-epipe' },
            prefixWithDate(`SUCCESS, val returned ${val}`));
        }
      });
  }).catch((error) => {
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('Clearing interval in catch'));
    clearInterval(timer);
    logger.error(
      { event: 'lcms:debug-epipe' },prefixWithDate('Error dans catch du promise ' + JSON.stringify(error, undefined, 2)));
  });
  return writableStream;
}
