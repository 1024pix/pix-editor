import classic from 'ember-classic-decorator';
import ApplicationSerializer from './application';

@classic
export default class AreaSerializer extends ApplicationSerializer {

  attrs = {
    name:'Nom',
    code:'Code',
    competences:'Competences (identifiants)'
  };

  payloadKeyFromModelName() {
    return 'Domaines';
  }
}
