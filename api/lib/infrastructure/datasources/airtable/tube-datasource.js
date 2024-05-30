import _ from 'lodash';
import { datasource } from './datasource.js';
import { findRecords } from '../../airtable.js';

export const tubeDatasource = datasource.extend({

  modelName: 'Tube',

  tableName: 'Tubes',

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

  async getAirtableIdsByIds(tubeIds) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: ['Record Id', 'id persistant'],
      filterByFormula: `OR(${tubeIds.map((id) => `'${id}' = {id persistant}`).join(',')})`,
    });
    const airtableIdsByIds = {};
    for (const tubeId of tubeIds) {
      airtableIdsByIds[tubeId] = airtableRawObjects.find((airtableRecord) => airtableRecord.get('id persistant') === tubeId)?.get('Record Id');
    }
    return airtableIdsByIds;
  },
});
