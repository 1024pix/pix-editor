import { datasource } from './datasource.js';
import { findRecords, stringValue } from '../../airtable.js';

export const attachmentDatasource = datasource.extend({

  modelName: 'Attachment',

  tableName: 'Attachments',

  usedFields: [
    'Record ID',
    'url',
    'size',
    'type',
    'mimeType',
    'filename',
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
      filename: airtableRecord.get('filename'),
      challengeId: airtableRecord.get('challengeId persistant')?.[0],
      localizedChallengeId: airtableRecord.get('localizedChallengeId'),
    };
  },

  /* Attributes to not write while in Airtable because they are formulas or lookups
    challengeId persistant                      (write "challengeId" instead)
   */
  toAirTableObject(model) {
    return {
      fields: {
        'url': model.url,
        'size': model.size,
        'type': model.type,
        'mimeType': model.mimeType,
        'filename': model.filename,
        'challengeId': [model.challengeId],
        'localizedChallengeId': model.localizedChallengeId,
      }
    };
  },

  async filterByLocalizedChallengeId(localizedChallengeId) {
    const airtableRawObjects = await findRecords(this.tableName, {
      filterByFormula : `{localizedChallengeId} = ${stringValue(localizedChallengeId)}`,
    });
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async filterByLocalizedChallengeIds(localizedChallengeIds) {
    if (localizedChallengeIds.length === 0) return undefined;
    const airtableRawObjects = await findRecords(this.tableName, {
      filterByFormula: `OR(${localizedChallengeIds.map((id) => `{localizedChallengeId} = ${stringValue(id)}`).join(',')})`,
    });
    if (airtableRawObjects.length === 0) return undefined;
    return airtableRawObjects.map(this.fromAirTableObject);
  },
});

