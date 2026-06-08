import { AdminJS, ComponentLoader } from 'adminjs';
import AdminJSSequelize from '@adminjs/sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { User, Release, Translations, LocalizedChallenge } from './models.js';
import { checkUserIsAuthenticatedViaBasicAndAdmin } from '../../../application/security-pre-handlers.js';

AdminJS.registerAdapter(AdminJSSequelize);

export { default as plugin } from '@adminjs/hapi';

const __dirname = dirname(fileURLToPath(import.meta.url));

const componentLoader = new ComponentLoader();
const Components = {
  ImportExportComponent: componentLoader.add('ImportExportComponent', join(__dirname, './components/ImportExportComponent.jsx')),
  GetEmbedList: componentLoader.add('GetEmbedList', join(__dirname, './components/GetEmbedList.jsx')),
  Dashboard: componentLoader.add('Dashboard', join(__dirname, './components/Dashboard.jsx')),
};

const readOnlyOptions = {
  edit: { isVisible: false },
  new: { isVisible: false },
  delete: { isVisible: false },
  bulkDelete: { isVisible: false },
};

export const options = {
  branding: { companyName: 'Pix Editor' },
  dashboard: { component: Components.Dashboard },
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
      options: {
        actions: {
          ...readOnlyOptions,
          getEmbedList: { component: Components.GetEmbedList },
        },
      },
    },
    {
      resource: Translations,
      options: {
        actions: {
          ...readOnlyOptions,
          importExport: {
            actionType: 'resource',
            component: Components.ImportExportComponent,
          },
        },
      },
    },
    {
      resource: LocalizedChallenge,
      options: { actions: readOnlyOptions },
    },
  ],
  auth: {
    strategy: 'session',
    cookiePassword: process.env.ADMIN_COOKIE_PASSWORD || 'very-long-password-for-tests-only',
    cookieName: 'adminCookie',
    authenticate: (email) => checkUserIsAuthenticatedViaBasicAndAdmin(email),
  },
};
