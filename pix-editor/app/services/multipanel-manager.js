import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MultipanelManager extends Service {
  @tracked gridShouldBeMinimized = false;
  @tracked tableShouldBeMinimized = false;

  reset() {
    this.gridShouldBeMinimized = false;
    this.tableShouldBeMinimized = false;
  }

  onDetailsClosed() {
    this.tableShouldBeMinimized = false;
  }

  onTableClosed() {
    this.gridShouldBeMinimized = false;
  }

  expandTable() {
    this.gridShouldBeMinimized = !this.gridShouldBeMinimized;
  }

  expandDetails() {
    this.tableShouldBeMinimized = !this.tableShouldBeMinimized;
  }
}
