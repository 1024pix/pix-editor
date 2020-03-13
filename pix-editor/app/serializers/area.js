import ApplicationSerializer from './application';

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
