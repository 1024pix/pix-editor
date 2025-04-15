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
  writableStream.on('close', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'Stream event: close');
  });
  writableStream.on('drain', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'Stream event: drain');
  });
  writableStream.on('error', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'Stream event: error');
  });
  writableStream.on('finish', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'Stream event: finish');
  });
  writableStream.on('pipe', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'Stream event: pipe');
  });
  writableStream.on('unpipe', () => {
    logger.info(
      { event: 'lcms:debug-epipe' },'Stream event: unpipe');
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
    writableStream.write('{');
    const keys = Object.keys(data);
    let ok = true;
    write();
    function write() {
      do {
        const key = keys.shift();
        logger.info(
          { event: 'lcms:debug-epipe' },`Streaming ${key} data`);
        logger.info(
          { event: 'lcms:debug-epipe' },`${data[key].length} items being send`);
        if (keys.length > 0) {
          ok = writableStream.write('"' + key + '":' + JSON.stringify(data[key]) + ',');
        } else {
          ok = writableStream.write('"' + key + '":' + JSON.stringify(data[key]) + ',', 'utf8', () => {
            if (ok) {
              logger.info(
                { event: 'lcms:debug-epipe' },'Writing directly final accolade');
              writableStream.end('}');
            } else {
              logger.info({ event: 'lcms:debug-epipe' },'Waiting for draining before writing accoalde');
              writableStream.once('drain', () => {
                logger.info({ event: 'lcms:debug-epipe' },'Writing after drain the accolade');
                writableStream.end('}');
                logger.info({ event: 'lcms:debug-epipe' },'Ending');
              });
            }
          });
        }
        const comma = keys.length > 0 ? ',' : '';
        ok = writableStream.write('"' + key + '":' + JSON.stringify(data[key]) + comma);
        if (!ok) {
          logger.info(
            { event: 'lcms:debug-epipe' },`Need draining after ${key}`);
        }
      } while (keys.length > 0 && ok);
      if (keys.length > 0) {
        logger.info(
          { event: 'lcms:debug-epipe' },'Waiting for draining before calling next write');
        writableStream.once('drain', write);
      }
    }
  }).catch((error) => {
    clearInterval(timer);
    logger.info(
      { event: 'lcms:debug-epipe' },'An error occurred');
    logger.error(
      { event: 'lcms:debug-epipe' },error);
    Sentry.captureException(error);
    logger.info(
      { event: 'lcms:debug-epipe' },`is stream closed ? ${writableStream.closed}`);
    if (!writableStream.closed) {
      writableStream.end('error');
    }
  });
  return writableStream;
}
