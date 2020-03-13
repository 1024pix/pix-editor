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
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      duration: airtableRecord.get('Durée'),
      format: airtableRecord.get('Format'),
      link: airtableRecord.get('Lien'),
      source: airtableRecord.get('Source'),
      title: airtableRecord.get('Titre'),
    };
  },
});

