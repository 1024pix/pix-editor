import _ from 'lodash';
import * as airtable from '../../airtable.js';

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

  async filter({ filter: { ids, formula } }) {
    const filterByFormula = ids ? (
      'OR(' + ids.map((id) => `${airtable.stringValue(id)} = {id persistant}`).join(',') + ')'
    ) : formula;
    const airtableRawObjects = await airtable.findRecords(
      this.tableName,
      {
        fields: this.usedFields,
        filterByFormula,
      },
    );
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async create(model) {
    const airtableRequestBody = this.toAirTableObject(model);
    const airtableRawObject = await airtable.createRecord(this.tableName, airtableRequestBody);
    return this.fromAirTableObject(airtableRawObject);
  },

  async createBatch(models) {
    const airtableRequestBodies = models.map(this.toAirTableObject);
    const airtableRawObjects = await airtable.createRecords(this.tableName, airtableRequestBodies);
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async update(model) {
    const airtableRequestBody = this.toAirTableObject(model);
    const airtableRawObject = await airtable.updateRecord(this.tableName, airtableRequestBody);
    return this.fromAirTableObject(airtableRawObject);
  },

  async updateBatch(models) {
    const airtableRequestBodies = models.map(this.toAirTableObject);
    const airtableRawObjects = await airtable.updateRecords(this.tableName, airtableRequestBodies);
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async upsert(models) {
    const airtableRecords = models.map((model) => this.toAirTableObject(model));
    const allAirtableRawObjects = [];
    for (const chunk of chunks(airtableRecords, 10)) {
      const airtableRawObjects = await airtable.upsertRecords(this.tableName, chunk, this.fieldsToMergeOn);
      allAirtableRawObjects.push(...airtableRawObjects.map((airtableRawObject) => this.fromAirTableObject(airtableRawObject)));
    }
    return allAirtableRawObjects;
  },

  async delete(ids) {
    return airtable.deleteRecords(this.tableName, ids);
  },

  async getAirtableIdsByIds(entityIds) {
    const airtableRawObjects = await airtable.findRecords(this.tableName, {
      fields: [this.airtableIdField, 'id persistant'],
      filterByFormula: `OR(${entityIds.map((id) => `'${id}' = {id persistant}`).join(',')})`,
    });
    return Object
      .fromEntries(airtableRawObjects
        .map((airtableObject) => [airtableObject.get('id persistant'), airtableObject.get(this.airtableIdField)]));
  },
};

function* chunks(array, chunkSize) {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

export const datasource = {

  extend(props) {
    props.sortField = props.sortField || 'id persistant';
    props.airtableIdField = props.airtableIdField || 'Record ID';
    const result = Object.assign({}, _DatasourcePrototype, props);
    _.bindAll(result, _.functions(result));
    return result;
  },

};
