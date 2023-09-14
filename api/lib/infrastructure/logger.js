import pino from 'pino';
import * as config from '../config.js';
import pretty from 'pino-pretty';

const nullDestination = { write() {} };

let destination = pino.destination();

if (config.logging.prettyPrint) {
  destination = pretty({
    colorize: true
  });
}

export const logger = pino(
  {
    level: config.logging.logLevel,
    redact: ['req.headers.authorization'],
  },
  config.logging.enabled ? destination : nullDestination
);

logger.debug('DEBUG logs enabled');
logger.trace('TRACE logs enabled');
