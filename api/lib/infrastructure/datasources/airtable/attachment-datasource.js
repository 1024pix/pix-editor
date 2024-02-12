import { datasource } from './datasource.js';
import { findRecords } from '../../airtable.js';

export const attachmentDatasource = datasource.extend({

  modelName: 'Attachment',

  tableName: 'Attachments',

  usedFields: [
    'Record ID',
    'url',
    'size',
    'type',
    'mimeType',
    'alt',
    'challengeId persistant',
    'localizedChallengeId',
  ],

  sortField: 'createdAt',

  fromAirTableObject(airtableRecord) {
    return {
      id: airtableRecord.get('Record ID'),
      url: airtableRecord.get('url'),
      size: airtableRecord.get('size'),
      type: airtableRecord.get('type'),
      mimeType: airtableRecord.get('mimeType'),
      alt: airtableRecord.get('alt'),
      challengeId: airtableRecord.get('challengeId persistant')?.[0],
      localizedChallengeId: airtableRecord.get('localizedChallengeId'),
    };
  },

  async filterByLocalizedChallengeId(localizedChallengeId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      filterByFormula : `{localizedChallengeId} = '${localizedChallengeId}'`,
    });
    return airtableRawObjects.map(this.fromAirTableObject);
  }
});

