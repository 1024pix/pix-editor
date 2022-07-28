const Pack = require('../package');
const Metrics = require('./infrastructure/plugins/metrics');
const settings = require('./config');
const Blipp = require('blipp');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const AdminBro = require('admin-bro');
const AdminBroPlugin = require('@admin-bro/hapi');
const AdminBroSequelize = require('@admin-bro/sequelize');
const { User, Release, Training } = require('./models');
const { get } = require('lodash');
const monitoringTools = require('./infrastructure/monitoring-tools');

AdminBro.registerAdapter(AdminBroSequelize);

const adminBroOptions = {
  resources: [
    {
      resource: User,
      options: {
        properties: {
          access: {
            availableValues: [
              {
                value: 'readonly',
                label: 'Lecture seule',
              },
              {
                value: 'editor',
                label: 'Editeur',
              },
              {
                value: 'admin',
                label: 'Admin',
              },
            ],
          },
        },
      },
    },
    Release,
    {
      resource: Training,
      options: {
        properties: {
          locale: {
            availableValues: [
              {
                value: 'fr-fr',
                label: 'Franco Français',
              },
            ],
          },
          type: {
            availableValues: [
              {
                value: 'autoformation',
                label: 'Parcours d\'autoformation',
              },
              {
                value: 'webinaire',
                label: 'Webinaire',
              },
            ],
          },
          duration: {
            props: { placeholder: '1d 10h 30m' },
            components: {
              show: AdminBro.bundle('../adminbro/components/show.duration.component.jsx'),
              list: AdminBro.bundle('../adminbro/components/list.duration.component.jsx'),
            },
          },
        },
      },
    },
  ],
  auth: { strategy: 'simple' },
};

function logObjectSerializer(obj) {
  if (settings.hapi.enableRequestMonitoring) {
    const context = monitoringTools.getContext();
    return {
      ...obj,
      user_id: get(context, 'request') ? monitoringTools.extractUserIdFromRequest(context.request) : '-',
      metrics: get(context, 'metrics'),
    };
  } else {
    return { ...obj };
  }
}

const plugins = [
  Metrics,
  Inert,
  Vision,
  Blipp,
  {
    plugin: require('hapi-pino'),
    options: {
      serializers: {
        req: logObjectSerializer,
      },
      instance: require('./infrastructure/logger'),
      logQueryParams: true,
    },
  },
  {
    plugin: AdminBroPlugin,
    options: adminBroOptions,
  },
  ...(settings.sentry.enabled
    ? [
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
            tags: [{ name: 'source', value: 'api' }],
          },
        },
      },
    ]
    : []),
];

module.exports = plugins;
