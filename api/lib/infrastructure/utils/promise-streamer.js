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

export function promiseStreamerForRepli2(promise) {
  const writableStream = new PassThrough();
  writableStream.on('close', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'WritableStream event: close');
  });
  writableStream.on('drain', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'WritableStream event: drain');
  });
  writableStream.on('error', (error) => {
    logger.info(
      { event: 'lcms:debug-epipe' },'WritableStream event: error');
    logger.error(
      { event: 'lcms:debug-epipe' }, error);
  });
  writableStream.on('finish', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'WritableStream event: finish');
  });
  writableStream.on('pipe', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'WritableStream event: pipe');
  });
  writableStream.on('unpipe', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'WritableStream event: unpipe');
  });
  const timer = setInterval(() => {
    logger.info(
      { event: 'lcms:debug-epipe' },
      'anti slash n');
    writableStream.write('\n');
  }, 1000);

  promise.then((data) => {
    clearInterval(timer);
    logger.info(
      { event: 'lcms:debug-epipe' },'Start sending data into stream');
    //const newData = _.omit(data, ['challenges', 'skills', 'tutorials']);
    const readableStream = Readable.from(JSON.stringify(data));
    readableStream.on('close', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },'ReadableStream event: close');
    });
    readableStream.on('data', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },'ReadableStream event: data');
    });
    readableStream.on('end', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },'ReadableStream event: end');
    });
    readableStream.on('error', (error) => {
      logger.info(
        { event: 'lcms:debug-epipe' },'ReadableStream event: error');
      logger.error(
        { event: 'lcms:debug-epipe' }, error);
    });
    readableStream.on('pause', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },'ReadableStream event: pause');
    });
    readableStream.on('readable', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },'ReadableStream event: readable');
    });
    readableStream.on('resume', () => {
      logger.info(
        { event: 'lcms:debug-epipe' },'ReadableStream event: resume');
    });
    pipeline(
      Readable.from(JSON.stringify(data)),
      writableStream,
      (err, val) => {
        if (err) {
          logger.error(
            { event: 'lcms:debug-epipe' }, 'error dans pipeline');
          logger.error(
            { event: 'lcms:debug-epipe' }, err);
        } else {
          logger.info(
            { event: 'lcms:debug-epipe' },
            `SUCCESS, val returned ${val}`);
        }
      });
  }).catch((error) => {
    logger.error(
      { event: 'lcms:debug-epipe' }, 'error dans catch du promise');
    logger.error(
      { event: 'lcms:debug-epipe' }, error);
  });
  return writableStream;
}
