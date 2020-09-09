import AirtableAdapter from './airtable';

export default class CompetenceAdapter extends AirtableAdapter {
  findAll(store, type, sinceToken) {
    return this.query(store, type, { since: sinceToken, sort: [{ field: 'Sous-domaine', direction: 'asc' }] });
  }

  pathForType() {
    return 'Competences';
  }

}
