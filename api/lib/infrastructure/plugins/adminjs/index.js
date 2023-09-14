import { AdminJS, ComponentLoader } from 'adminjs';
import AdminJSSequelize from '@adminjs/sequelize';
import { User, Release, Translations } from './models.js';
import { checkUserIsAuthenticatedViaBasicAndAdmin } from '../../../application/security-pre-handlers.js';

AdminJS.registerAdapter(AdminJSSequelize);

export { default as plugin } from '@adminjs/hapi';

const componentLoader = new ComponentLoader();
const Components = {
  ExportComponent: componentLoader.add('ExportComponent', './components/ExportComponent.jsx'),
};

export const options = {
  componentLoader,
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
    {
      resource: Release,
    },
    {
      resource: Translations,
      options: {
        actions: {
          export: {
            actionType: 'resource',
            component: Components.ExportComponent,
          },
        },
      },
    },
  ],
  auth: {
    strategy: 'session',
    cookiePassword: process.env.ADMIN_COOKIE_PASSWORD || 'very-long-password-for-tests-only',
    cookieName: 'adminCookie',
    authenticate: (email) => checkUserIsAuthenticatedViaBasicAndAdmin(email),
  },
};

