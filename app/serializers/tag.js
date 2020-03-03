import classic from 'ember-classic-decorator';
import ApplicationSerializer from './application';

@classic
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
