import { PassThrough, pipeline } from 'node:stream';
import { child, logger as genericLogger } from '../logger.js';
import * as config from '../../config.js';

const NB_CHARS_PER_CHUNK = 65_536;

function getWritableStream() {
  const writableStream = new PassThrough();
  writableStream.headers = {
    'content-type': 'application/json',
  };
  if (config.hapi.shouldCompressLargeJson) {
    writableStream.headers['content-encoding'] = 'gzip';
  } else {
    // WHY: to avoid compression because when compressing, the server buffers
    // for too long causing a response timeout.
    writableStream.headers['content-encoding'] = 'identity';
  }
  return writableStream;
}

export function promiseStreamer({
  promise,
  writableStream = getWritableStream(),
  loggingScope,
}) {
  let logger = genericLogger;
  if (loggingScope) {
    logger = child('promisestream', { event: loggingScope });
  }
  const timer = setInterval(() => {
    writableStream.write('\n');
  }, 1000);
  writableStream.on('error', (err) => {
    logger.error(`WritableStream error: ${err}`);
  });
  writableStream.on('finish', () => {
    logger.info('WritableStream close');
  });
  writableStream.on('pipe', () => {
    logger.info('WritableStream pipe');
  });

  logger.info('Gathering data...');
  promise.then((data) => {
    logger.info('Data gathered, streaming about to begin...');
    clearInterval(timer);
    pipeline(
      chunk(data),
      writableStream,
      (err) => {
        if (err) {
          logger.error(`Streaming pipeline error: ${err}`);
          if (!writableStream.closed && !writableStream.errored) {
            writableStream.end('error');
          }
        } else {
          logger.info('Streaming pipeline done');
        }
      }
    );
  }).catch((err) => {
    clearInterval(timer);
    if (!writableStream.closed && !writableStream.errored) {
      writableStream.end('error');
    }
    logger.error(`Error in promise : ${err}`);
  });
  return writableStream;
}

function* chunk(data) {
  const stringifiedData = JSON.stringify(data);
  for (let i = 0; i < stringifiedData.length; i += NB_CHARS_PER_CHUNK) {
    yield stringifiedData.slice(i, i + NB_CHARS_PER_CHUNK);
  }
}
