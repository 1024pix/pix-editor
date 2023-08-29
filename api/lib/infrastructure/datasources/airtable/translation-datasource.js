const datasource = require('./datasource');

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
      if (err.statusCode === 404) {
        return false;
      }
      throw err;
    }
  }
});
