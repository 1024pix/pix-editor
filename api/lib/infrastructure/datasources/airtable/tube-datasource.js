import _ from 'lodash';
import { datasource } from './datasource.js';

export const tubeDatasource = datasource.extend({

  modelName: 'Tube',

  tableName: 'Tubes',

  airtableIdField: 'Record Id',

  usedFields: [
    'id persistant',
    'Nom',
    'Competences (id persistant)',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      name: airtableRecord.get('Nom'),
      competenceId: _.head(airtableRecord.get('Competences (id persistant)')),
    };
  },
});
