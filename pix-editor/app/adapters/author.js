import AirtableAdapter from './airtable';
import { inject as service } from '@ember/service';

export default class AuthorAdapter extends AirtableAdapter {
  @service config;

  get namespace() {
    return 'v0/' + this.config.airtableEditorBase;
  }

  pathForType() {
    return 'Auteurs';
  }
}
