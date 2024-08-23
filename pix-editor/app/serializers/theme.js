import AirtableSerializer from './airtable';

export default class ThemeSerializer extends AirtableSerializer {
  primaryKey = 'Record Id';

  attrs = {
    pixId: 'id persistant',
    name: 'Nom',
    nameEnUs: 'Titre en-us',
    rawTubes: 'Tubes',
    competence: 'Competence',
    index: 'Index',
  };

  payloadKeyFromModelName() {
    return 'Thematiques';
  }
}
