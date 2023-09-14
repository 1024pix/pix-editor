import AdminJS from 'adminjs';
import AdminJSSequelize from '@adminjs/sequelize';
import { User, Release } from './models.js';
import AdminJSHapi from '@adminjs/hapi';

AdminJS.registerAdapter(AdminJSSequelize);

// HACK: to be removed after upgrading to adminjs v7
export const plugin = AdminJSHapi.default ?? AdminJSHapi;

export const options = {
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
