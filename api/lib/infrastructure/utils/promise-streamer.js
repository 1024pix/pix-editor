const Sentry = require('@sentry/node');
const logger = require('../logger');

module.exports = {
  promiseStreamer(promise, writableStream) {
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
