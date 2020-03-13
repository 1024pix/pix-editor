import ApplicationAdapter from './application';

export default class AreaAdapter extends ApplicationAdapter {

  findAll(store, type, sinceToken) {
    return this.query(store, type,{ since: sinceToken, sort:[{field: 'Nom', direction: 'asc'}] });
  }

  pathForType() {
    return 'Domaines';
  }
}
