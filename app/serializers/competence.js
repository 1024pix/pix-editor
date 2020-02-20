import classic from 'ember-classic-decorator';
import ApplicationSerializer from './application';

@classic
export default class CompetenceSerializer extends ApplicationSerializer {
  primaryKey = 'Record ID';

  attrs = {
    name:'Référence',
    title:'Titre',
    code:'Sous-domaine',
    rawTubes:'Tubes',
    description:'Description',
    pixId:'id persistant'
  };

  payloadKeyFromModelName() {
    return 'Competences';
  }
}
