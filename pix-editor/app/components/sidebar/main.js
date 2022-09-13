import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pixeditor/config/environment';

export default class SidebarMain extends Component {
  version = ENV.APP.version;

  @service access;
  @service config;
  @service currentData;

  get author() {
    return this.config.author;
  }

  get areas() {
    return this.currentData.getAreas();
  }

  get mayGenerateTargetProfile() {
    return this.access.isReadOnly();
  }
}
