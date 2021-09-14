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

const plugins = [
  Metrics,
  Inert,
  Vision,
  Blipp,
  {
    plugin: require('hapi-pino'),
    options: {
      instance: require('./infrastructure/logger'),
      logQueryParams: true,
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
