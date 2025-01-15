import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MultipanelManager extends Service {
  @tracked gridShouldBeMinimized = false;

  get tableShouldBeExpanded() {
    return this.gridShouldBeMinimized;
  }

  reset() {
    this.gridShouldBeMinimized = false;
  }

  expandTable() {
    this.gridShouldBeMinimized = !this.gridShouldBeMinimized;
  }
}
