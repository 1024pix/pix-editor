import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LogoutComponent extends Component {

  @service window

  @action
  logout() {
    event.preventDefault();
    localStorage.removeItem('pix-api-key');
    this.window.reload();
  }
}
