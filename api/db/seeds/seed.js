const DatabaseBuilder = require('../../tests/tooling/database-builder/database-builder');

exports.seed = (knex) => {
  const databaseBuilder = new DatabaseBuilder({ knex });

  databaseBuilder.factory.buildUser({
    trigram: 'DEV',
    name: 'Utilisateur pour le développement',
    access: 'admin',
    apiKey: '8566d79c-e2b1-43c8-b303-00e6c85feee0',
  });

  return databaseBuilder.commit();
};
