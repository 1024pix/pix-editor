const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Framework',

  tableName: 'Referentiel',

  sortField: 'Nom',

  usedFields: [
    'Nom',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.id,
      name: airtableRecord.get('Nom')
    };
  },

});

