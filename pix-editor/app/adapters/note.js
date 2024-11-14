import AirtableAdapter from './airtable';

export default class NoteAdapter extends AirtableAdapter {

  namespace = '/api/airtable/changelog';

  pathForType() {
    return 'Notes';
  }
}
