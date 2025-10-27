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

  sortField: 'Code',

  async listByFrameworkId(frameworkId) {
    const areas = await this.list();
    return areas.filter((area) => area.frameworkId === frameworkId);
  },

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.id,
      code: airtableRecord.get('Code'),
      competenceIds: airtableRecord.get('Competences (identifiants) (id persistant)') ?? [],
      competenceAirtableIds: airtableRecord.get('Competences (identifiants)') ?? [],
      color: airtableRecord.get('Couleur'),
      frameworkId: airtableRecord.get('Referentiel')[0],
    };
  },

  toAirTableObject(area) {
    return {
      fields: {
        'id persistant': area.id,
        Code: area.code,
        Referentiel: [area.frameworkId],
      },
    };
  },
});
