import AirtableAdapter from './airtable';

export default class ThemeAdapter extends AirtableAdapter {

  pathForType() {
    return 'Thematiques';
  }
}
