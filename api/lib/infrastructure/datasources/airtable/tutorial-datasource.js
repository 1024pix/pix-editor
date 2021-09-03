const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Tutorial',

  tableName: 'Tutoriels',

  usedFields: [
    'id persistant',
    'Durée',
    'Format',
    'Lien',
    'Source',
    'Titre',
    'Langue',
    'Solution à',
    'En savoir plus',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      duration: airtableRecord.get('Durée'),
      format: airtableRecord.get('Format'),
      link: airtableRecord.get('Lien'),
      source: airtableRecord.get('Source'),
      title: airtableRecord.get('Titre'),
      locale: airtableRecord.get('Langue'),
      tutorialForSkills: airtableRecord.get('Solution à'),
      furtherInformation: airtableRecord.get('En savoir plus'),
    };
  },
});

