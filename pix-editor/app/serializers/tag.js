import AirtableSerializer from './airtable';

export default class TagSerializer extends AirtableSerializer {

  primaryKey = 'Record ID';

  attrs = {
    title: 'Nom',
    description: 'Description',
    notes: 'Notes',
    skills: 'Acquis',
    tutorials: 'Tutoriels',
    pixId: 'id persistant'
  };

  payloadKeyFromModelName() {
    return 'Tags';
  }

}
