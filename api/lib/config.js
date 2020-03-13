const path = require('path');

function isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

module.exports = (function() {

  const config = {
    rootPath: path.normalize(__dirname + '/..'),

    port: parseInt(process.env.PORT, 10) || 3002,

    environment: (process.env.NODE_ENV || 'development'),

    hapi: {
      options: {}
    },

    airtable: {
      apiKey: process.env.CYPRESS_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY,
      base: process.env.CYPRESS_AIRTABLE_BASE || process.env.AIRTABLE_BASE,
    },

    logging: {
      enabled: isFeatureEnabled(process.env.LOG_ENABLED),
      colorEnabled: (process.env.NODE_ENV === 'development'),
      logLevel: (process.env.LOG_LEVEL || 'info'),
    },

  };

  if (process.env.NODE_ENV === 'test') {
    config.port = 0;

    config.airtable.apiKey = 'test-api-key';
    config.airtable.base = 'test-base';

    config.logging.enabled = false;
  }

  return config;

})();
