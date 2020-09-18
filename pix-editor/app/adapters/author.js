import ApplicationAdapter from './application';

export default class AuthorAdapter extends ApplicationAdapter {

  pathForType() {
    return 'users';
  }
  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${super.urlForQueryRecord(...arguments)}/me`;
    }
    return super.urlForQueryRecord(...arguments);
  }
}