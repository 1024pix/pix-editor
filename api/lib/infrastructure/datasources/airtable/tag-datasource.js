import { datasource } from './datasource.js';

export const tagDatasource = datasource.extend({

  modelName: 'Tag',

  tableName: 'Tags',

  airtableIdField: 'Record ID',

  usedFields: [
    'id persistant',
    'Nom',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.id,
      name: airtableRecord.get('Nom'),
    };
  },

  toAirTableObject(model) {
    const airtableObject = {
      fields: {
        'id persistant': model.id,
        Nom: model.name,
      },
    };
    if (model.airtableId) airtableObject.id = model.airtableId;
    return airtableObject;
  },
});
