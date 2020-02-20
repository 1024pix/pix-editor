import classic from 'ember-classic-decorator';
import ApplicationSerializer from './application';

@classic
export default class AuthorSerializer extends ApplicationSerializer {

  attrs = {
    name:'Nom',
    access:'Accès'
  };

  payloadKeyFromModelName() {
    return 'Auteurs';
  }
}
