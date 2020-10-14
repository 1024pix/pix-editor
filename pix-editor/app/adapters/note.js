import AirtableAdapter from './airtable';
import { inject as service } from '@ember/service';

export default class NoteAdapter extends AirtableAdapter {

  @service config;

  namespace = '/api/airtable/changelog';
  
  pathForType() {
    return 'Notes';
  }
}
