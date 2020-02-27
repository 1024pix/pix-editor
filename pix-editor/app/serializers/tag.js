import ApplicationSerializer from './application';

export default class TagSerializer extends ApplicationSerializer {

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
