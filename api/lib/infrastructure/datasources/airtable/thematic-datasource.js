import { findRecords, stringValue } from '../../airtable.js';
import { datasource } from './datasource.js';

export const thematicDatasource = datasource.extend({

  modelName: 'Thematic',

  tableName: 'Thematiques',

  airtableIdField: 'Record Id',

  usedFields: [
    'id persistant',
    'Competence',
    'Competence (id persistant)',
    'Tubes (id persistant)',
    'Index',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.id,
      competenceId: airtableRecord.get('Competence (id persistant)')[0],
      competenceAirtableId: airtableRecord.get('Competence')[0],
      tubeIds: airtableRecord.get('Tubes (id persistant)') ?? [],
      index: airtableRecord.get('Index'),
    };
  },

  toAirTableObject(model) {
    return {
      fields: {
        'id persistant': model.id,
        Competence: [model.competenceAirtableId],
        Index: model.index,
      },
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
