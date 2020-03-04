import ApplicationSerializer from './application';

export default class AuthorSerializer extends ApplicationSerializer {

  attrs = {
    name:'Nom',
    access:'Accès'
  };

  payloadKeyFromModelName() {
    return 'Auteurs';
  }
}
