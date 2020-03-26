import ApplicationSerializer from './application';

export default class CompetenceSerializer extends ApplicationSerializer {
  primaryKey = 'Record ID';

  attrs = {
    name:'Référence',
    title:'Titre',
    code:'Sous-domaine',
    rawTubes:'Tubes',
    description:'Description',
    pixId:'id persistant',
    source:'Origine'
  };

  payloadKeyFromModelName() {
    return 'Competences';
  }
}
