import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@glimmer/component';
import ENV from 'pixeditor/config/environment';

export default class SidebarMain extends Component {
  version = ENV.APP.version;

  @service config;

  @alias('config.author')
  author;

}
