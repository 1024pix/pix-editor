const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Area',

  tableName: 'Domaines',

  usedFields: [
    'id persistant',
    'Code',
    'Nom',
    'Titre fr-fr',
    'Titre en-us',
    'Competences (identifiants) (id persistant)',
    'Competences (identifiants)',
    'Couleur',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      code: airtableRecord.get('Code'),
      titleFrFr: airtableRecord.get('Titre fr-fr') || airtableRecord.get('Titre'),
      titleEnUs: airtableRecord.get('Titre en-us') || airtableRecord.get('Titre'),
      name: airtableRecord.get('Nom'),
      competenceIds: airtableRecord.get('Competences (identifiants) (id persistant)'),
      competenceAirtableIds: airtableRecord.get('Competences (identifiants)'),
      color: airtableRecord.get('Couleur'),
    };
  },

});

