import { inject as service } from '@ember/service';

import AirtableAdapter from './airtable';

export default class NoteAdapter extends AirtableAdapter {

  @service config;

  namespace = '/api/airtable/changelog';

  pathForType() {
    return 'Notes';
  }
}
