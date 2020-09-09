import AirtableAdapter from './airtable';
import { inject as service } from '@ember/service';

export default class NoteAdapter extends AirtableAdapter {

  @service config;

  get namespace() {
    return 'v0/' + this.config.airtableEditorBase;
  }

  pathForType() {
    return 'Notes';
  }
}
