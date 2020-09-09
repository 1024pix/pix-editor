import AirtableAdapter from './airtable';

export default class AreaAdapter extends AirtableAdapter {

  findAll(store, type, sinceToken) {
    return this.query(store, type, { since: sinceToken, sort: [{ field: 'Nom', direction: 'asc' }] });
  }

  pathForType() {
    return 'Domaines';
  }
}
