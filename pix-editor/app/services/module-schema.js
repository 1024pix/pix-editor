import Service from '@ember/service';

const MODULE_SCHEMA_FETCH_URL = '/api/module-schema/module-json-schema.json';

export default class ModuleSchemaService extends Service {
  async load(fetchFn = fetch) {
    const response = await fetchFn(MODULE_SCHEMA_FETCH_URL);
    return response.json();
  }
}
