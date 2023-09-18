import { AdminJS, ComponentLoader } from 'adminjs';
import AdminJSSequelize from '@adminjs/sequelize';
import { User, Release, Translations } from './models.js';
import { checkUserIsAuthenticatedViaBasicAndAdmin } from '../../../application/security-pre-handlers.js';

AdminJS.registerAdapter(AdminJSSequelize);

export { default as plugin } from '@1024pix/adminjs-hapijs';

const componentLoader = new ComponentLoader();
const Components = {
  ImportExportComponent: componentLoader.add('ImportExportComponent', './components/ImportExportComponent.jsx'),
};

export const options = {
  branding: {
    companyName: 'Pix Editor',
  },
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
          importExport: {
            actionType: 'resource',
            component: Components.ImportExportComponent,
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

