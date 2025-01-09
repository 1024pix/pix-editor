import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MultipanelManager extends Service {
  @tracked gridShouldBeMinimized = false;

  reset() {
    this.gridShouldBeMinimized = false;
  }

  expandTable() {
    this.gridShouldBeMinimized = !this.gridShouldBeMinimized;
  }
}
