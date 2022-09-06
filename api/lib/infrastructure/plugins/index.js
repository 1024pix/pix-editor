const config = require('../../config');
const Blipp = require('blipp');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');

const plugins = [
  require('./metrics'),
  Inert,
  Vision,
  Blipp,
  require('./adminjs'),
  require('./pino'),
  ...(config.sentry.enabled ? [require('./sentry')] : []),
];

module.exports = plugins;
