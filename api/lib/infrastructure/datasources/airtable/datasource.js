const _ = require('lodash');
const airtable = require('../../airtable');

const _DatasourcePrototype = {
  path() {
    return `${this.modelName.toLowerCase()}s`;
  },

  async list(params = {}) {
    const options = { fields: this.usedFields, sort: [{ field: this.sortField, direction: 'asc' }] };
    if (params.page && params.page.size) {
      options.maxRecords = params.page.size;
    }
    const airtableRawObjects = await airtable.findRecords(this.tableName, options);
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async filter({ filter: { ids } }) {
    const airtableRawObjects = await airtable.findRecords(
      this.tableName,
      {
        fields: this.usedFields,
        filterByFormula: 'OR(' + ids.map((id) => `'${id}' = {id persistant}`).join(',') + ')'
      },
    );
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async create(model) {
    const airtableRequestBody = this.toAirTableObject(model);
    const airtableRawObject = await airtable.createRecord(this.tableName, airtableRequestBody);
    return this.fromAirTableObject(airtableRawObject);
  },

  async update(model) {
    const airtableRequestBody = this.toAirTableObject(model);
    const airtableRawObject = await airtable.updateRecord(this.tableName, airtableRequestBody);
    return this.fromAirTableObject(airtableRawObject);
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
