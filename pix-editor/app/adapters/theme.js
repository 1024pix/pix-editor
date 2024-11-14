import AirtableAdapter from './airtable';

export default class ThemeAdapter extends AirtableAdapter {

  fields = [
    'Record Id',
    'id persistant',
    'Tubes',
    'Competence',
    'Index',
  ];

  pathForType() {
    return 'Thematiques';
  }
}
