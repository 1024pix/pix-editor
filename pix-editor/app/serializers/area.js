import AirtableSerializer from './airtable';

export default class AreaSerializer extends AirtableSerializer {

  primaryKey = 'Record ID';

  attrs = {
    pixId: 'id persistant',
    code: 'Code',
    name: 'Nom',
    titleFrFr: 'Titre fr-fr',
    titleEnUs: 'Titre en-us',
    competences: 'Competences (identifiants)',
  };

  payloadKeyFromModelName() {
    return 'Domaines';
  }
}
