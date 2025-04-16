import * as Sentry from '@sentry/node';
import { logger } from '../logger.js';
import { PassThrough, pipeline, Readable } from 'node:stream';

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
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('Creating the readable stream'));
    const readableStream = Readable.from(JSON.stringify(data));
    readableStream.on('close', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },prefixWithDate('ReadableStream event: close'));
    });
    readableStream.on('data', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },prefixWithDate('ReadableStream event: data'));
    });
    readableStream.on('end', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },prefixWithDate('ReadableStream event: end'));
    });
    readableStream.on('error', (error) => {
      logger.info(
        { event: 'lcms:debug-epipe' },prefixWithDate('ReadableStream event: error ' + JSON.stringify(error, undefined, 2)));
    });
    readableStream.on('pause', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },prefixWithDate('ReadableStream event: pause'));
    });
    readableStream.on('readable', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },prefixWithDate('ReadableStream event: readable'));
    });
    readableStream.on('resume', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },prefixWithDate('ReadableStream event: resume'));
    });
    logger.info(
      { event: 'lcms:debug-epipe' },prefixWithDate('Start sending data into stream'));
    pipeline(
      readableStream,
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
