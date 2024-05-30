import { datasource } from './datasource.js';
import { findRecords } from '../../airtable.js';

export const tutorialDatasource = datasource.extend({

  modelName: 'Tutorial',

  tableName: 'Tutoriels',

  usedFields: [
    'id persistant',
    'Durée',
    'Format',
    'Lien',
    'Source',
    'Titre',
    'Langue',
    'Solution à',
    'En savoir plus',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('id persistant'),
      duration: airtableRecord.get('Durée'),
      format: airtableRecord.get('Format'),
      link: airtableRecord.get('Lien'),
      source: airtableRecord.get('Source'),
      title: airtableRecord.get('Titre'),
      locale: airtableRecord.get('Langue'),
      tutorialForSkills: airtableRecord.get('Solution à'),
      furtherInformation: airtableRecord.get('En savoir plus'),
    };
  },

  async getAirtableIdsByIds(tutorialIds) {
    const airtableRawObjects = await findRecords(this.tableName, {
      fields: ['Record ID', 'id persistant'],
      filterByFormula: `OR(${tutorialIds.map((id) => `'${id}' = {id persistant}`).join(',')})`,
    });
    const airtableIdsByIds = {};
    for (const tutorialId of tutorialIds) {
      airtableIdsByIds[tutorialId] = airtableRawObjects.find((airtableRecord) => airtableRecord.get('id persistant') === tutorialId)?.get('Record ID');
    }
    return airtableIdsByIds;
  },
});

