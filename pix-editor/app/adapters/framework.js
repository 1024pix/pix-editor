import AirtableAdapter from './airtable';

export default class FrameworkAdapter extends AirtableAdapter {

  findAll(store, type, sinceToken) {
    return this.query(store, type, { since: sinceToken, sort: [{ field: 'Date', direction: 'asc' }] });
  }

  pathForType() {
    return 'Referentiel';
  }
}
