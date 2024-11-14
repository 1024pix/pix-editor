import AirtableAdapter from './airtable';

export default class CompetenceAdapter extends AirtableAdapter {

  fields = [
    'Record ID',
    'Sous-domaine',
    'Thematiques',
    'Tubes',
    'id persistant',
    'Origine',
    'Domaine',
  ];
  sort = [{ field: 'Sous-domaine', direction: 'asc' }];

  pathForType() {
    return 'Competences';
  }
}
