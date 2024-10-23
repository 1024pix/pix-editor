import _ from 'lodash';
import { datasource } from './datasource.js';
import { findRecords, stringValue } from '../../airtable.js';

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
      airtableId: airtableRecord.id,
      name: airtableRecord.get('Nom'),
      // FIXME remplacer par Competence (via Thematique) (id persistant) ?
      competenceId: _.head(airtableRecord.get('Competences (id persistant)')),
    };
  },

  async listByCompetenceId(competenceId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: this.usedFields,
      filterByFormula: `{Competence (via Thematique) (id persistant)} = ${stringValue(competenceId)}`,
    });
    if (airtableRawObjects.length === 0) return undefined;
    return airtableRawObjects.map(this.fromAirTableObject);
  },
});
