import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';

export default class AuthorAdapter extends ApplicationAdapter {
  @service config;

  get namespace() {
    return 'v0/' + this.config.airtableEditorBase;
  }

  pathForType() {
    return 'Auteurs';
  }
}
