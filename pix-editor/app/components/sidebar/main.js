import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@glimmer/component';
import ENV from 'pixeditor/config/environment';

export default class SidebarMain extends Component {
  version = ENV.APP.version;

  @service config;
  @service currentData;

  @alias('config.author')
  author;

  get areas() {
    return this.currentData.getAreas();
  }

}
