const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Thematic',

  tableName: 'Thematiques',

  usedFields: [
    'Nom',
    'Competence (id persistant)',
    'Tubes (id persistant)',
    'Index',
  ],

  sortField: 'Nom',

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.id,
      name: airtableRecord.get('Nom'),
      competenceId: airtableRecord.get('Competence (id persistant)')[0],
      tubeIds: airtableRecord.get('Tubes (id persistant)'),
      index: airtableRecord.get('Index'),
    };
  }
});

