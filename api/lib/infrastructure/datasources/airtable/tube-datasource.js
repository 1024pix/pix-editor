const _ = require('lodash');
const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Tube',

  tableName: 'Tubes',

  usedFields: [
    'id persistant',
    'Nom',
    'Titre',
    'Description',
    'Titre pratique fr-fr',
    'Titre pratique en-us',
    'Description pratique fr-fr',
    'Description pratique en-us',
    'Competences (id persistant)',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Nom'),
      title: airtableRecord.get('Titre'),
      description: airtableRecord.get('Description'),
      practicalTitle_i18n: {
        fr: airtableRecord.get('Titre pratique fr-fr'),
        en: airtableRecord.get('Titre pratique en-us'),
      },
      practicalDescription_i18n: {
        fr: airtableRecord.get('Description pratique fr-fr'),
        en: airtableRecord.get('Description pratique en-us'),
      },
      competenceId: _.head(airtableRecord.get('Competences (id persistant)')),
    };
  },
});
