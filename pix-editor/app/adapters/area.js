import AirtableAdapter from './airtable';

export default class AreaAdapter extends AirtableAdapter {
  findAll(store, type, sinceToken) {
    return this.query(store, type, { since: sinceToken, sort: [{ field: 'Code', direction: 'asc' }] });
  }

  pathForType() {
    return 'Domaines';
  }
}
