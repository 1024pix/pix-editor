import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';
import {computed} from '@ember/object';

@classic
export default class AuthorAdapter extends ApplicationAdapter {
  @service
  config;

  @computed('config.airtableEditorBase')
  get namespace() {
    return 'v0/'+this.get('config').get('airtableEditorBase');
  }

  pathForType() {
    return 'Auteurs';
  }
}
