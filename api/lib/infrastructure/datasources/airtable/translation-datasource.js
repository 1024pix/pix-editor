const datasource = require('./datasource');
const logger = require('../../logger');

module.exports = datasource.extend({

  modelName: 'Translation',

  tableName: 'translations',

  sortField: 'key_locale',

  usedFields: [
    'key',
    'locale',
    'value',
  ],

  fieldsToMergeOn: [
    'key',
    'locale',
  ],

  fromAirTableObject(airtableRecord) {
    return {
      key: airtableRecord.get('key'),
      locale: airtableRecord.get('locale'),
      value: airtableRecord.get('value'),
    };
  },

  toAirTableObject(model) {
    return {
      fields: {
        'key': model.key,
        'locale': model.locale,
        'value': model.value,
      },
    };
  },

  async exists() {
    try {
      await this.list({ page: { size: 1 } });
      return true;
    } catch (err) {
      // When using API key, Airtable returns status code 404 if table doesn't exist
      // When using personal access token, Airtable returns status code 403 if table doesn't exist
      if (err.statusCode !== 403 && err.statusCode !== 404) {
        logger.error(err, 'Error while checking for Airtable translations table');
      }
      return false;
    }
  }
});
