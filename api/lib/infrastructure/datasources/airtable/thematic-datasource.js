import { findRecords, stringValue } from '../../airtable.js';
import { datasource } from './datasource.js';

export const thematicDatasource = datasource.extend({

  modelName: 'Thematic',

  tableName: 'Thematiques',

  airtableIdField: 'Record Id',

  usedFields: [
    'id persistant',
    'Competence (id persistant)',
    'Tubes (id persistant)',
    'Index',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.id,
      competenceId: airtableRecord.get('Competence (id persistant)')[0],
      tubeIds: airtableRecord.get('Tubes (id persistant)'),
      index: airtableRecord.get('Index'),
    };
  },

  async listByCompetenceId(competenceId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: this.usedFields,
      filterByFormula: `{Competence (id persistant)} = ${stringValue(competenceId)}`,
    });
    if (airtableRawObjects.length === 0) return undefined;
    return airtableRawObjects.map(this.fromAirTableObject);
  },
});
