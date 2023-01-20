const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Competence',

  tableName: 'Competences',

  usedFields: [
    'id persistant',
    'Titre',
    'Titre fr-fr',
    'Titre en-us',
    'Sous-domaine',
    'Description',
    'Description fr-fr',
    'Description en-us',
    'Domaine (id persistant)',
    'Acquis (via Tubes) (id persistant)',
    'Thematiques',
    'Origine2',
    'Référence',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      name_i18n: {
        fr: airtableRecord.get('Titre fr-fr') || airtableRecord.get('Titre'),
        en: airtableRecord.get('Titre en-us') || airtableRecord.get('Titre'),
      },
      index: airtableRecord.get('Sous-domaine'),
      description_i18n: {
        fr: airtableRecord.get('Description fr-fr') || airtableRecord.get('Description'),
        en: airtableRecord.get('Description en-us') || airtableRecord.get('Description'),
      },
      areaId: airtableRecord.get('Domaine (id persistant)') ? airtableRecord.get('Domaine (id persistant)')[0] : '',
      skillIds: airtableRecord.get('Acquis (via Tubes) (id persistant)') || [],
      thematicIds: airtableRecord.get('Thematiques') || [],
      origin: airtableRecord.get('Origine2')[0],
      fullName: airtableRecord.get('Référence'),
    };
  },

});

