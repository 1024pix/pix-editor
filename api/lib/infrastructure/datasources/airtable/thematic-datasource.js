import { datasource } from './datasource.js';

export const thematicDatasource = datasource.extend({

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
      name_i18n: {
        fr: airtableRecord.get('Nom'),
        en: airtableRecord.get('Titre en-us'),
      },
      competenceId: airtableRecord.get('Competence (id persistant)')[0],
      tubeIds: airtableRecord.get('Tubes (id persistant)'),
      index: airtableRecord.get('Index'),
    };
  }
});
