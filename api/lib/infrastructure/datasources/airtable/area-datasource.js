const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Area',

  tableName: 'Domaines',

  usedFields: [
    'id persistant',
    'Code',
    'Nom',
    'Titre',
    'Titre fr-fr',
    'Titre en-us',
    'Competences (identifiants) (id persistant)',
    'Competences (identifiants)',
    'Couleur',
    'Referentiel',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      code: airtableRecord.get('Code'),
      title_i18n: {
        fr: airtableRecord.get('Titre fr-fr') || airtableRecord.get('Titre'),
        en: airtableRecord.get('Titre en-us') || airtableRecord.get('Titre'),
      },
      name: airtableRecord.get('Nom'),
      competenceIds: airtableRecord.get('Competences (identifiants) (id persistant)'),
      competenceAirtableIds: airtableRecord.get('Competences (identifiants)'),
      color: airtableRecord.get('Couleur'),
      frameworkId: airtableRecord.get('Referentiel')[0],
    };
  },

});
