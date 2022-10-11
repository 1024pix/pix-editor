const AdminJS = require('adminjs');
const AdminJSPlugin = require('@adminjs/hapi').default;
const AdminJSSequelize = require('@adminjs/sequelize');
const { User, Release } = require('../../models');

AdminJS.registerAdapter(AdminJSSequelize);

const adminJSOptions = {
  resources: [
    {
      resource: User,
      options: {
        properties: {
          access: {
            availableValues: [
              {
                value: 'readpixonly',
                label: 'Lecture seule référentiel Pix',
              },
              {
                value: 'readonly',
                label: 'Lecture seule',
              },
              {
                value: 'replicator',
                label: 'Réplicateur',
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
  ],
  auth: { strategy: 'simple' },
};

module.exports = {
  plugin: AdminJSPlugin,
  options: adminJSOptions,
};
