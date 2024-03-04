import RESTAdapter from '@ember-data/adapter/rest';

export default class ApiAdapter extends RESTAdapter {
  urlForQueryRecord() {
    return '/api';
  }
}
