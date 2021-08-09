import { inject as service } from '@ember/service';
import JSONAPIAdapter from '@ember-data/adapter/json-api';

export default class ApplicationAdapter extends JSONAPIAdapter {

  @service auth;
  @service ajaxQueue;

  namespace = 'api';

  get headers() {
    const headers = {};
    const apiKey = this.auth.key;
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return headers;
  }

  ajax() {
    return this.ajaxQueue.add(() => super.ajax(...arguments));
  }
}
