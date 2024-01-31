import { datasource } from './datasource.js';

export const areaDatasource = datasource.extend({

  modelName: 'Area',

  tableName: 'Domaines',

  usedFields: [
    'id persistant',
    'Code',
    'Competences (identifiants) (id persistant)',
    'Competences (identifiants)',
    'Couleur',
    'Referentiel',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      code: airtableRecord.get('Code'),
      competenceIds: airtableRecord.get('Competences (identifiants) (id persistant)'),
      competenceAirtableIds: airtableRecord.get('Competences (identifiants)'),
      color: airtableRecord.get('Couleur'),
      frameworkId: airtableRecord.get('Referentiel')[0],
    };
  },

});
