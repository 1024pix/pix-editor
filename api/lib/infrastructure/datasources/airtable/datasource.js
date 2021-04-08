const _ = require('lodash');
const airtable = require('../../airtable');

const _DatasourcePrototype = {
  path() {
    return `${this.modelName.toLowerCase()}s`;
  },

  async list() {
    const airtableRawObjects = await airtable.findRecords(this.tableName, { fields: this.usedFields, sort: [{ field: this.sortField, direction: 'asc' }] });
    return airtableRawObjects.map(this.fromAirTableObject);
  },

};

module.exports = {

  extend(props) {
    props.sortField = props.sortField || 'id persistant';
    const result = Object.assign({}, _DatasourcePrototype, props);
    _.bindAll(result, _.functions(result));
    return result;
  },

};
