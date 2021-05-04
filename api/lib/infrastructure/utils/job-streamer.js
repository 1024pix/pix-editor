const Sentry = require('@sentry/node');
const logger = require('../logger');

module.exports = { jobStreamer(job, writableStream) {
  const timer = setInterval(() => {
    writableStream.write('\n');
  }, 1000);
  job.finished().then((data) => {
    writableStream.write(JSON.stringify(data));
    clearInterval(timer);
    writableStream.end();
  }
  ).catch((error) => {
    logger.error(error);
    Sentry.captureException(error);
    clearInterval(timer);
    writableStream.write('error');
    writableStream.end();
  });
  return writableStream;
}
};
