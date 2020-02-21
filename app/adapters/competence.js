import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class CompetenceAdapter extends ApplicationAdapter {
  findAll(store, type, sinceToken) {
    return this.query(store, type, { since: sinceToken, sort:[{field: 'Sous-domaine', direction: 'asc'}] });
  }

  pathForType() {
    return 'Competences';
  }

}
