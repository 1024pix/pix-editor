const pino = require('pino');
const settings = require('../config');

const nullDestination = { write() {} };

const logger = pino(
  {
    level: settings.logging.logLevel,
    redact: ['req.headers.authorization'],
    transport: settings.logging.prettyPrint && {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
  settings.logging.enabled ? pino.destination() : nullDestination
);

logger.debug('DEBUG logs enabled');
logger.trace('TRACE logs enabled');

module.exports = logger;
