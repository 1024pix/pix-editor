import pino from 'pino';
import * as config from '../config.js';
import pretty from 'pino-pretty';
import micromatch from 'micromatch';

const nullDestination = { write() {} };

let destination = pino.destination();

if (config.logging.prettyPrint) {
  destination = pretty({
    colorize: true,
  });
}

/**
 * Creates a child logger for a section.
 * Debug may be enabled for a section using LOG_DEBUG.
 * @param {string} section
 * @param {pino.Bindings} bindings
 * @param {pino.ChildLoggerOptions} options
 */
export function child(section, bindings, options) {
  /** @type{Partial<pino.ChildLoggerOptions>} */
  const optionsOverride = {};
  if (micromatch.isMatch(section, config.logging.debugSections)) {
    optionsOverride.level = 'debug';
  }
  return logger.child(bindings, { ...options, ...optionsOverride });
}

export const logger = pino(
  {
    level: config.logging.logLevel,
    redact: ['req.headers.authorization'],
  },
  config.logging.enabled ? destination : nullDestination,
);

export const SCOPES = {
  REPLICATION: 'replication',
  RELEASE: 'release',
};

logger.debug('DEBUG logs enabled');
logger.trace('TRACE logs enabled');
