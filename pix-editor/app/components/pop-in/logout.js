import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import * as Sentry from '@sentry/ember';

export default class LogoutComponent extends Component {

  @service window
  @service auth;

  @action
  logout() {
    event.preventDefault();
    this.auth.key = undefined;
    Sentry.configureScope(scope => scope.setUser(null));
    this.window.reload();
  }
}
