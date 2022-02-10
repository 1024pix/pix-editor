'use strict';

function _isFeatureEnabled(environmentVariable) {
  return environmentVariable === 'true';
}

module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'pixeditor',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
        // Prevent overriding String.prototype.
        String: false,
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      version:require('../package.json').version,
      MAX_CONCURRENT_AJAX_CALLS: _getEnvironmentVariableAsNumber({ environmentVariableName: 'MAX_CONCURRENT_AJAX_CALLS', defaultValue: 4, minValue: 1 }),
    },

    fontawesome: {
      warnIfNoIconsIncluded: false,
    },

    '@sentry/ember': {
      disablePerformance: true,
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: (process.env.SENTRY_ENVIRONMENT || 'development'),
        maxBreadcrumbs: _getEnvironmentVariableAsNumber({ environmentVariable: process.env.SENTRY_MAX_BREADCRUMBS, defaultValue: 100, minValue: 100 }),
        debug: _isFeatureEnabled(process.env.SENTRY_DEBUG),
        release: `v${process.env.npm_package_version}`,
      },
    },

    sentry: {
      enabled: _isFeatureEnabled(process.env.SENTRY_ENABLED),
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.locationType = 'hash';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
    ENV.rootURL = '/';
    ENV.locationType = 'hash';
  }

  return ENV;
};

function _getEnvironmentVariableAsNumber({ environmentVariableName, defaultValue, minValue }) {
  const valueToValidate = process.env[environmentVariableName] || defaultValue;
  const number = parseInt(valueToValidate, 10);
  if (!isNaN(number) && number >= minValue) {
    return number;
  }
  throw new Error(`Invalid value '${valueToValidate}' for environment variable '${environmentVariableName}'. It should be a number greater than or equal ${minValue}.`);
}

