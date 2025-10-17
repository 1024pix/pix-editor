import { datasource } from './datasource.js';
import { findRecords, stringValue } from '../../airtable.js';

export const tagDatasource = datasource.extend({

  modelName: 'Tag',

  tableName: 'Tags',

  usedFields: [
    'id persistant',
    'Nom',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.id,
      title: airtableRecord.get('Nom'),
    };
  },

  toAirTableObject(model) {
    const airtableObject = {
      fields: {
        'id persistant': model.id,
        Nom: model.title,
      },
    };
    if (model.airtableId) airtableObject.id = model.airtableId;
    return airtableObject;
  },

  async searchByTitle(title) {
    const filterByFormula = `FIND(${stringValue(title.toLowerCase())}, LOWER(Nom))`;
    const records = await findRecords(this.tableName, {
      filterByFormula,
      fields: this.usedFields,
      sort: [{ field: 'Nom', direction: 'asc' }],
      maxRecords: 4,
    });

    if (records.length === 0) return undefined;
    return records.map(this.fromAirTableObject);
  },

  async findByTitle(title) {
    const filterByFormula = `${stringValue(title.toLowerCase())} = LOWER(Nom)`;
    const records = await findRecords(this.tableName, {
      filterByFormula,
      fields: this.usedFields,
      sort: [{ field: 'Nom', direction: 'asc' }],
      maxRecords: 1,
    });

    if (records.length === 0) return undefined;
    return this.fromAirTableObject(records[0]);
  },
});
