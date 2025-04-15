import * as Sentry from '@sentry/node';
import { logger } from '../logger.js';
import { PassThrough, pipeline } from 'node:stream';

const CHUNK_SIZE = 200_000;

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

export function promiseStreamerForRepli(promise) {
  const writableStream = new PassThrough();
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
              logger.info({ event: 'lcms:debug-epipe' },'Waiting for draining before writing accolade');
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

export function promiseStreamerForRepli2(promise) {
  const writableStream = new PassThrough();
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

    function* chunk(data, size) {
      const stringifiedData = JSON.stringify(data);
      for (let i = 0; i < stringifiedData.length; i += size) {
        yield stringifiedData.slice(i, i + size);
      }
    }

    /*
    const iter = {
      keys: Object.keys(data),
      isFirst: true,
      chunksLeftToSend: [],
      next() {
        const key = this.keys.shift();
        const thisOneIsFirst = this.isFirst;
        this.isFirst = false;
        if (key) {
          logger.info(
            { event: 'lcms:debug-epipe' },
            `dans iter, traitement de la clé ${key}`);
          const chunks = [...chunk(JSON.stringify(data[key]))];
          const firstChunk = chunks[0];
          return {
            value: { key, data: firstChunk, isFirst: thisOneIsFirst, isLast: this.keys.length === 0 && this.chunksLeftToSend.length === 0 },
            done: false,
          };
        } else {
          logger.info(
            { event: 'lcms:debug-epipe' },
            'dans iter, plus de clé a dépiler');
          return {
            done: true,
          };
        }
      },
      [Symbol.iterator]() {
        return this;
      }
    };*/
    /*const jsonStringifyTransform = new Transform({
      writableObjectMode: true,
      transform(chunk, _encoding, callback) {
        logger.info(
          { event: 'lcms:debug-epipe' },
          `dans transform, traitement de la clé ${chunk.key}`);
        /*const commaOrCloseBracket = chunk.isLast ? '}' : ',';
        const openBracketOrNothing = chunk.isFirst ? '{' : '';
        callback(null, openBracketOrNothing + '"' + chunk.key + '":' + JSON.stringify(chunk.data) + commaOrCloseBracket);*/
    // this.push('COUCOUMAMAN--');
    //callback();
    //},
    // });
    pipeline(
      chunk(data, CHUNK_SIZE),
      //jsonStringifyTransform,
      writableStream,
      (err) => {
        if (err) {
          logger.error(
            { event: 'lcms:debug-epipe' }, 'error dans pipeline');
          logger.error(
            { event: 'lcms:debug-epipe' }, err);
        } else {
          logger.info(
            { event: 'lcms:debug-epipe' },
            'SUCCESS');
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
