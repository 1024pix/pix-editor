import ApplicationSerializer from './application';

export default class AuthorSerializer extends ApplicationSerializer {
  modelNameFromPayloadKey() {
    return 'author';
  }
}