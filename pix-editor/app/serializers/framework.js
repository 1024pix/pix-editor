import AirtableSerializer from './airtable';

export default class FrameworkSerializer extends AirtableSerializer {
  primaryKey = 'Record ID';

  attrs = {
    name:'Nom',
    areas: 'Domaines (identifiants)'
  };

  payloadKeyFromModelName() {
    return 'Referentiel';
  }
}
