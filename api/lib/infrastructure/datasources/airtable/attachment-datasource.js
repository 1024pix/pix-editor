const datasource = require('./datasource');
const airtable = require('../../airtable');

module.exports = datasource.extend({

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
      challengeId: airtableRecord.get('challengeId persistant')[0],
    };
  },

  async filterByChallengeId(challengeId) {
    const airtableRawObjects = await airtable.findRecords(this.tableName, {
      filterByFormula : `{challengeId persistant} = '${challengeId}'`,
    });
    return airtableRawObjects.map(this.fromAirTableObject);
  }
});

