import { datasource } from './datasource.js';

export const frameworkDatasource = datasource.extend({
  modelName: 'Framework',

  tableName: 'Referentiel',

  sortField: 'Date',

  usedFields: ['Nom', 'Domaines (identifiants)', 'Domaines (identifiants) (id persistant)'],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.id,
      name: airtableRecord.get('Nom'),
      areaAirtableIds: airtableRecord.get('Domaines (identifiants)') ?? [],
      areaIds: airtableRecord.get('Domaines (identifiants) (id persistant)') ?? [],
    };
  },

  toAirTableObject(framework) {
    return {
      fields: {
        Nom: framework.name,
      },
    };
  },
});
