import { DatabaseBuilder } from '../../tests/tooling/database-builder/database-builder.js';
import { staticCoursesBuilder } from './data/static-courses.js';
import { translationsBuilder } from './data/translations.js';

export async function seed(knex) {
  const databaseBuilder = new DatabaseBuilder({ knex });
  databaseBuilder.factory.buildUser({
    trigram: 'DEV',
    name: 'Utilisateur pour le développement',
    access: 'admin',
    apiKey: process.env.REVIEW_APP_ADMIN_USER_API_KEY || adminUserApiKey,
  });

  databaseBuilder.factory.buildUser({
    trigram: 'EDI',
    name: 'Editeur pour le développement',
    access: 'editor',
    apiKey: process.env.REVIEW_APP_EDITOR_USER_API_KEY || defaultEditorUserApiKey,
  });

  databaseBuilder.factory.buildUser({
    trigram: 'RPO',
    name: 'Lecteur pix pour le développement',
    access: 'readpixonly',
    apiKey: process.env.REVIEW_APP_READ_PIX_ONLY_USER_API_KEY || readPixOnlyUserApiKey,
  });

  databaseBuilder.factory.buildUser({
    trigram: 'LOL',
    name: 'Lecteur TOUT pour le développement',
    access: 'readonly',
    apiKey: process.env.REVIEW_APP_READ_ONLY_USER_API_KEY || readOnlyUserApiKey,
  });

  staticCoursesBuilder(databaseBuilder);

  await translationsBuilder(databaseBuilder);

  return databaseBuilder.commit();
}

const adminUserApiKey = !process.env.REVIEW_APP && '8d03a893-3967-4501-9dc4-e0aa6c6dc442';
const defaultEditorUserApiKey = !process.env.REVIEW_APP && 'adaf3eee-09dc-4f9a-a504-ff92e74c9d0f';
const readPixOnlyUserApiKey = !process.env.REVIEW_APP && '09ae36c4-11e1-4212-ae51-e5719d142f57';
const readOnlyUserApiKey = !process.env.REVIEW_APP && '3b234506-e31e-45eb-a56e-17f64f31ca1b';
