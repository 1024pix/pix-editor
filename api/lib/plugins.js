const Pack = require('../package');
const Metrics = require('./infrastructure/plugins/metrics');
const settings = require('./config');
const Blipp = require('blipp');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const AdminBro = require('admin-bro');
const AdminBroPlugin = require('@admin-bro/hapi');
const AdminBroSequelize = require('@admin-bro/sequelize');
const { User, Release } = require('./models');

AdminBro.registerAdapter(AdminBroSequelize);

const isProduction = ['production', 'staging'].includes(process.env.NODE_ENV);

const adminBroOptions = {
  resources: [{
    resource: User,
    options: {
      properties: {
        access: {
          availableValues: [
            {
              value: 'readonly',
              label: 'Lecture seule'
            },
            {
              value: 'editor',
              label: 'Editeur'
            },
            {
              value: 'admin',
              label: 'Admin'
            }
          ],
        },
      },
    },
  }, Release],
  auth: { strategy: 'simple' }
};

const consoleReporters =
  isProduction ?
    [
      {
        module: 'good-squeeze',
        name: 'SafeJson',
        args: []
      },
    ]
    :
    [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          response: '*',
          log: '*'
        }]
      },
      {
        module: 'good-console',
        args: [{
          color: settings.logging.colorEnabled
        }]
      }
    ]
    ;

if (settings.logging.enabled) {
  consoleReporters.push('stdout');
}

const plugins = [
  Metrics,
  Inert,
  Vision,
  Blipp,
  {
    plugin: require('good'),
    options: {
      reporters: {
        console: consoleReporters,
      },
    },
  },
  {
    plugin: AdminBroPlugin,
    options: adminBroOptions,
  },
  ...(settings.sentry.enabled ? [
    {
      plugin: require('hapi-sentry'),
      options: {
        client: {
          dsn: settings.sentry.dsn,
          environment: settings.sentry.environment,
          release: `v${Pack.version}`,
          maxBreadcrumbs: settings.sentry.maxBreadcrumbs,
          debug: settings.sentry.debug,
          maxValueLength: settings.sentry.maxValueLength,
        },
        scope: {
          tags: [
            { name: 'source', value: 'api' },
          ],
        },
      },
    },
  ] : []),
];

module.exports = plugins;
