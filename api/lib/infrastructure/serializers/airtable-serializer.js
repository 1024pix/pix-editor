import _ from 'lodash';
import * as datasources from '../datasources/airtable/index.js';
import airtable from 'airtable';

export function serialize({ airtableObject, tableName }) {
  const datasource = _.filter(datasources, (datasource) => datasource.tableName === tableName)[0];
  const model = datasource.path();
  const record = new airtable.Record(model, airtableObject.fields['id persistant'], airtableObject);
  const updatedRecord = datasource.fromAirTableObject(record);
  return { updatedRecord, model };
}
