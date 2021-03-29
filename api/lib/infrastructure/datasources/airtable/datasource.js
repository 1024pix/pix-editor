const _ = require('lodash');
const airtable = require('../../airtable');

const _DatasourcePrototype = {
  path() {
    return `${this.modelName.toLowerCase()}s`;
  },

  async list() {
    const airtableRawObjects = await airtable.findRecords(this.tableName, { fields: this.usedFields });
    return airtableRawObjects.map(this.fromAirTableObject);
  },

};

module.exports = {

  extend(props) {
    const result = Object.assign({}, _DatasourcePrototype, props);
    _.bindAll(result, _.functions(result));
    return result;
  },

};
