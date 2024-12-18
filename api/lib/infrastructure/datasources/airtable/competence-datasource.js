import { stringValue } from '../../airtable.js';
import { datasource } from './datasource.js';

export const competenceDatasource = datasource.extend({

  modelName: 'Competence',

  tableName: 'Competences',

  usedFields: [
    'id persistant',
    'Sous-domaine',
    'Domaine (id persistant)',
    'Domaine',
    'Acquis (via Tubes) (id persistant)',
    'Thematiques',
    'Thematiques (id persistant)',
    'Origine2',
    'Tubes',
  ],

  sortField: 'Sous-domaine',

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      airtableId: airtableRecord.id,
      index: airtableRecord.get('Sous-domaine'),
      areaId: airtableRecord.get('Domaine (id persistant)')?.[0] ?? '',
      areaAirtableId: airtableRecord.get('Domaine')?.[0] ?? '',
      skillIds: airtableRecord.get('Acquis (via Tubes) (id persistant)') ?? [],
      thematicIds: airtableRecord.get('Thematiques (id persistant)') ?? [],
      thematicAirtableIds: airtableRecord.get('Thematiques') ?? [],
      origin: airtableRecord.get('Origine2')[0],
      tubeAirtableIds: airtableRecord.get('Tubes') ?? [],
    };
  },

  toAirTableObject(competence) {
    return {
      fields: {
        'id persistant': competence.id,
        'Sous-domaine': competence.index,
        Domaine: [competence.areaAirtableId],
      }
    };
  },

  async listByAreaAirtableId(areaAirtableId) {
    return this.filter({ filter: { formula: `Domaine = ${stringValue(areaAirtableId)}` } });
  },
});
