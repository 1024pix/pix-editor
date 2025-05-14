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
    'Thematique',
    'Competences',
    'Competences (id persistant)',
    'Index',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.id,
      name: airtableRecord.get('Nom'),
      index: airtableRecord.get('Index'),
      thematicAirtableId: airtableRecord.get('Thematique')[0],
      competenceAirtableId: airtableRecord.get('Competences')[0],
      competenceId: airtableRecord.get('Competences (id persistant)')[0],
    };
  },

  toAirTableObject(model) {
    return {
      fields: {
        'id persistant': model.id,
        Nom: model.name,
        Thematique: [model.thematicAirtableId],
        Competences: [model.competenceAirtableId],
        Index: model.index,
      },
    };
  },

  async listByCompetenceId(competenceId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: this.usedFields,
      filterByFormula: `{Competences (id persistant)} = ${stringValue(competenceId)}`,
    });
    if (airtableRawObjects.length === 0) return undefined;
    return airtableRawObjects.map(this.fromAirTableObject);
  },
});
