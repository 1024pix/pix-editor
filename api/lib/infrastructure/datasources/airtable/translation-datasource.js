const datasource = require('./datasource');

module.exports = datasource.extend({

  modelName: 'Translation',

  tableName: 'translations',

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
});
