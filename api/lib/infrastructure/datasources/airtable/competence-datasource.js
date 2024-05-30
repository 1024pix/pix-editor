import { datasource } from './datasource.js';
import { findRecords } from '../../airtable.js';

export const competenceDatasource = datasource.extend({

  modelName: 'Competence',

  tableName: 'Competences',

  usedFields: [
    'id persistant',
    'Sous-domaine',
    'Domaine (id persistant)',
    'Acquis (via Tubes) (id persistant)',
    'Thematiques (id persistant)',
    'Origine2',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      index: airtableRecord.get('Sous-domaine'),
      areaId: airtableRecord.get('Domaine (id persistant)') ? airtableRecord.get('Domaine (id persistant)')[0] : '',
      skillIds: airtableRecord.get('Acquis (via Tubes) (id persistant)') || [],
      thematicIds: airtableRecord.get('Thematiques (id persistant)') || [],
      origin: airtableRecord.get('Origine2')[0],
    };
  },

  async getAirtableIdsByIds(competenceIds) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: ['Record ID', 'id persistant'],
      filterByFormula: `OR(${competenceIds.map((id) => `'${id}' = {id persistant}`).join(',')})`,
    });
    const airtableIdsByIds = {};
    for (const competenceId of competenceIds) {
      airtableIdsByIds[competenceId] = airtableRawObjects.find((airtableRecord) => airtableRecord.get('id persistant') === competenceId)?.get('Record ID');
    }
    return airtableIdsByIds;
  },
});
