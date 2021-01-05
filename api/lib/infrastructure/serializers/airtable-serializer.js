const _ = require('lodash');
const datasources = require('../datasources/airtable');
const airtable = require('airtable');

module.exports = {
  serialize({ airtableObject, tableName }) {
    const datasource = _.filter(datasources, (datasource) => datasource.tableName === tableName)[0];
    const model = `${datasource.modelName.toLowerCase()}s`;
    const record = new airtable.Record(model, airtableObject.fields['id persistant'], airtableObject);
    const updatedRecord = datasource.fromAirTableObject(record);
    return { updatedRecord, model };
  }
};
