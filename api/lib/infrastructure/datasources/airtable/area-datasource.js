const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Area',

  tableName: 'Domaines',

  usedFields: [
    'id persistant',
    'Code',
    'Nom',
    'Competences (identifiants)'
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      code: airtableRecord.get('Code'),
      name: airtableRecord.get('Nom'),
      competenceIds: airtableRecord.get('Competences (identifiants)'),
    };
  },

});

