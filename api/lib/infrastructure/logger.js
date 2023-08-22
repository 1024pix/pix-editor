const pino = require('pino');
const settings = require('../config');

const nullDestination = { write() {} };

let destination = pino.destination();

if (settings.logging.prettyPrint) {
  const pretty = require('pino-pretty');
  destination = pretty({
    colorize: true
  });
}

const logger = pino(
  {
    level: settings.logging.logLevel,
    redact: ['req.headers.authorization'],
  },
  settings.logging.enabled ? destination : nullDestination
);

logger.debug('DEBUG logs enabled');
logger.trace('TRACE logs enabled');

module.exports = logger;
