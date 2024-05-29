import { datasource } from './datasource.js';

export const thematicDatasource = datasource.extend({

  modelName: 'Thematic',

  tableName: 'Thematiques',

  usedFields: [
    'id persistant',
    'Competence (id persistant)',
    'Tubes (id persistant)',
    'Index',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      competenceId: airtableRecord.get('Competence (id persistant)')[0],
      tubeIds: airtableRecord.get('Tubes (id persistant)'),
      index: airtableRecord.get('Index'),
    };
  }
});
