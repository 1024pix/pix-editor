const datasource = require('./datasource');

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

});

