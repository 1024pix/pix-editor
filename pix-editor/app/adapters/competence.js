import ApplicationAdapter from './application';

export default class CompetenceAdapter extends ApplicationAdapter {
  findAll(store, type, sinceToken) {
    return this.query(store, type, { since: sinceToken, sort:[{ field: 'Sous-domaine', direction: 'asc' }] });
  }

  pathForType() {
    return 'Competences';
  }

}
