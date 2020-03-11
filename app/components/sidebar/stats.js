import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SidebarStatsComponent extends Component {

  @action
  getStatistics() {
    console.log('bouh');
  }
}
