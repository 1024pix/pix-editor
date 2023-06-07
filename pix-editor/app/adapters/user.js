import ApplicationAdapter from './application';

export default class UserAdapter extends ApplicationAdapter {
  get headers() {
    if(this.apiKeyForAuthenticationTrial) {
      return { 'Authorization' : `Bearer ${this.apiKeyForAuthenticationTrial}` };
    }
    return super.headers;
  }

  async queryRecord(store, type, query, adapterOptions) {
    this.apiKeyForAuthenticationTrial = query.apiKeyForAuthenticationTrial;
    delete query.apiKeyForAuthenticationTrial;
    try {
      return super.queryRecord(store, type, query, adapterOptions);
    } finally {
      this.apiKeyForAuthenticationTrial = null;
    }
  }

  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${super.urlForQueryRecord(...arguments)}/me`;
    }
    return super.urlForQueryRecord(...arguments);
  }
}
