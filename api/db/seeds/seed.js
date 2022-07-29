const DatabaseBuilder = require('../../tests/tooling/database-builder/database-builder');

exports.seed = (knex) => {
  const databaseBuilder = new DatabaseBuilder({ knex });

  databaseBuilder.factory.buildUser({
    trigram: 'DEV',
    name: 'Utilisateur pour le développement',
    access: 'admin',
    apiKey: process.env.REVIEW_APP_USER_API_KEY || adminUserApiKey,
  });

  databaseBuilder.factory.buildUser({
    trigram: 'EDI',
    name: 'Editeur pour le développement',
    access: 'editor',
    apiKey: process.env.REVIEW_APP_EDITOR_USER_API_KEY || defaultEditorUserApiKey,
  });

  databaseBuilder.factory.buildTraining({
    title: 'Travail de groupe et collaboration entre les personnels',
    link: 'https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924',
    type: 'autoformation',
    duration: '06:00:00',
    locale: 'fr-fr',
    targetProfileIds: [1822, 2214],
  });

  databaseBuilder.factory.buildTraining({
    title: 'Moodle : Partager et échanger ses ressources',
    link: 'https://tube-strasbourg.beta.education.fr/videos/watch/7df08eb6-603e-46a8-9be3-a34092fe7e68',
    type: 'webinaire',
    duration: '01:00:00',
    locale: 'fr-fr',
    targetProfileIds: [1777],
  });

  return databaseBuilder.commit();
};

const adminUserApiKey = !process.env.REVIEW_APP && '8d03a893-3967-4501-9dc4-e0aa6c6dc442';
const defaultEditorUserApiKey = !process.env.REVIEW_APP && 'adaf3eee-09dc-4f9a-a504-ff92e74c9d0f';
