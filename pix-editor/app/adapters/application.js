import JSONAPIAdapter from '@ember-data/adapter/json-api';

export default class ApplicationAdapter extends JSONAPIAdapter {

  namespace = 'api';

  get headers() {
    const headers = {};
    const apiKey = localStorage.getItem('pix-api-key');
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    return headers;
  }
}
