import AirtableSerializer from './airtable';

export default class CompetenceSerializer extends AirtableSerializer {
  primaryKey = 'Record ID';

  attrs = {
    name:'Référence',
    title:'Titre fr-fr',
    code:'Sous-domaine',
    rawThemes: 'Thematiques',
    rawTubes:'Tubes',
    description:'Description',
    pixId:'id persistant',
    source:'Origine'
  };

  payloadKeyFromModelName() {
    return 'Competences';
  }
}
