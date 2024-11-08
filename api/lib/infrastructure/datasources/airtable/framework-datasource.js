import { datasource } from './datasource.js';

export const frameworkDatasource = datasource.extend({

  modelName: 'Framework',

  tableName: 'Referentiel',

  sortField: 'Date',

  usedFields: [
    'Nom',
    'Domaines (identifiants)',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.id,
      name: airtableRecord.get('Nom'),
      areaIds: airtableRecord.get('Domaines (identifiants)'),
    };
  },

  toAirTableObject(framework) {
    return {
      fields: {
        Nom: framework.name,
      }
    };
  },
});

