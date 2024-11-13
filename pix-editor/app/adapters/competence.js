import AirtableAdapter from './airtable';

export default class CompetenceAdapter extends AirtableAdapter {

  sort = [{ field: 'Sous-domaine', direction: 'asc' }];

  pathForType() {
    return 'Competences';
  }
}
