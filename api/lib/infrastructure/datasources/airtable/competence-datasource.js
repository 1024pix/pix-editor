const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Competence',

  tableName: 'Competences',

  usedFields: [
    'id persistant',
    'Sous-domaine',
    'Domaine (id persistant)',
    'Acquis (via Tubes) (id persistant)',
    'Thematiques',
    'Origine2',
    'Référence',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      index: airtableRecord.get('Sous-domaine'),
      areaId: airtableRecord.get('Domaine (id persistant)') ? airtableRecord.get('Domaine (id persistant)')[0] : '',
      skillIds: airtableRecord.get('Acquis (via Tubes) (id persistant)') || [],
      thematicIds: airtableRecord.get('Thematiques') || [],
      origin: airtableRecord.get('Origine2')[0],
      fullName: airtableRecord.get('Référence'),
    };
  },

});

