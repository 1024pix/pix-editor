import RESTSerializer from '@ember-data/serializer/rest';

export default class ApiSerializer extends RESTSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    const apis = { id: 0 };
    for (const key of Object.keys(payload)) {
      apis[key] = payload[key];
      delete payload[key];
    }
    payload.apis = apis;
    return super.normalizeResponse(store, primaryModelClass, payload, id, requestType);
  }
}
