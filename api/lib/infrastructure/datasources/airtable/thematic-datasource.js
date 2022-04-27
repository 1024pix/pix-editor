const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Thematic',

  tableName: 'Thematiques',

  usedFields: [
    'Nom',
    'Titre en-us',
    'Competence (id persistant)',
    'Tubes (id persistant)',
    'Index',
  ],

  sortField: 'Nom',

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.id,
      name: airtableRecord.get('Nom'),
      nameEnUs: airtableRecord.get('Titre en-us'),
      competenceId: airtableRecord.get('Competence (id persistant)')[0],
      tubeIds: airtableRecord.get('Tubes (id persistant)'),
      index: airtableRecord.get('Index'),
    };
  }
});

