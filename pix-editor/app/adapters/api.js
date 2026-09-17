import { RESTAdapter } from '@warp-drive/legacy/adapter/rest';

export default class ApiAdapter extends RESTAdapter {
  urlForQueryRecord() {
    return '/api';
  }
}
