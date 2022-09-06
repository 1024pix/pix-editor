const AdminJS = require('adminjs');
const AdminJSPlugin = require('@adminjs/hapi').default;
const AdminJSSequelize = require('@adminjs/sequelize');
const { User, Release, Training } = require('../../models');

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
              show: AdminJS.bundle('../../../adminjs/components/show.duration.component.jsx'),
              list: AdminJS.bundle('../../../adminjs/components/list.duration.component.jsx'),
            },
          },
        },
      },
    },
  ],
  auth: { strategy: 'simple' },
};

module.exports = {
  plugin: AdminJSPlugin,
  options: adminJSOptions,
};
