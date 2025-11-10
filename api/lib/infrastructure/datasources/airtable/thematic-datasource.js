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
    'Tubes',
    'Index',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.id,
      competenceId: airtableRecord.get('Competence (id persistant)')[0],
      competenceAirtableId: airtableRecord.get('Competence')[0],
      tubeIds: airtableRecord.get('Tubes (id persistant)') ?? [],
      tubeAirtableIds: airtableRecord.get('Tubes') ?? [],
      index: airtableRecord.get('Index'),
    };
  },

  toAirTableObject(model) {
    const airtableObject = {
      fields: {
        'id persistant': model.id,
        Competence: [model.competenceAirtableId],
        Index: model.index,
      },
    };
    if (model.airtableId) airtableObject.id = model.airtableId;
    return airtableObject;
  },

  async listByCompetenceId(competenceId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: this.usedFields,
      filterByFormula: `{Competence (id persistant)} = ${stringValue(competenceId)}`,
    });
    if (airtableRawObjects.length === 0) return undefined;
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async listByCompetenceAirtableId(competenceAirtableId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: this.usedFields,
      filterByFormula: `Competence = ${stringValue(competenceAirtableId)}`,
    });
    if (airtableRawObjects.length === 0) return undefined;
    return airtableRawObjects.map(this.fromAirTableObject);
  },
});
