import AirtableSerializer from './airtable';

export default class AuthorSerializer extends AirtableSerializer {

  attrs = {
    name:'Nom',
    access:'Accès'
  };

  payloadKeyFromModelName() {
    return 'Auteurs';
  }
}
