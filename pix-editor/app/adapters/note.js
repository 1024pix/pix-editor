import AirtableAdapter from './airtable';

export default class NoteAdapter extends AirtableAdapter {

  pathForType() {
    return 'Notes';
  }
}
