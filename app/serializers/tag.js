import classic from 'ember-classic-decorator';
import ApplicationSerializer from './application';

@classic
export default class TagSerializer extends ApplicationSerializer {
  attrs = {
    title: 'Nom',
    description: 'Description',
    notes: 'Notes',
    skills: 'Acquis',
    tutorials: 'Tutoriels',
  };

  payloadKeyFromModelName() {
    return 'Tags';
  }

}
