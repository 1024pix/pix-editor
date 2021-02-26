import AirtableSerializer from './airtable';

export default class ThemeSerializer extends AirtableSerializer {
  primaryKey = 'Record Id';

  attrs = {
    name: 'Nom',
    rawTubes: 'Tubes',
    competence: 'Competence',
    index: 'Index'
  };

  payloadKeyFromModelName() {
    return 'Thematiques';
  }
}
