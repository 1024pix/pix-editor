const _ = require('lodash');
const airtable = require('../../airtable');

const _DatasourcePrototype = {

  async list() {
    const airtableRawObjects = await airtable.findRecords(this.tableName, this.usedFields);
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
