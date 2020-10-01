const DatabaseBuilder = require('../../tests/tooling/database-builder/database-builder');

exports.seed = (knex) => {
  const databaseBuilder = new DatabaseBuilder({ knex });

  databaseBuilder.factory.buildUser({
    trigram: 'DEV',
    name: 'Utilisateur pour le développement',
    access: 'admin',
    apiKey: process.env.REVIEW_APP_USER_API_KEY || defaultUserApiKey,
  });

  return databaseBuilder.commit();
};

const defaultUserApiKey = !process.env.REVIEW_APP && '8d03a893-3967-4501-9dc4-e0aa6c6dc442';

