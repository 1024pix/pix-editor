const Sentry = require('@sentry/node');
const logger = require('../logger');
const { PassThrough } = require('stream');

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

module.exports = {
  promiseStreamer(promise, writableStream = getWritableStream()) {
    const timer = setInterval(() => {
      writableStream.write('\n');
    }, 1000);
    promise.then((data) => {
      writableStream.write(JSON.stringify(data));
      clearInterval(timer);
      writableStream.end();
    }).catch((error) => {
      logger.error(error);
      Sentry.captureException(error);
      clearInterval(timer);
      writableStream.write('error');
      writableStream.end();
    });
    return writableStream;
  }
};
