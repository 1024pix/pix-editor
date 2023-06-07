import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import * as Sentry from '@sentry/ember';

export default class LogoutComponent extends Component {
  @service session;

  @action
  logout(event) {
    event.preventDefault();
    Sentry.configureScope(scope => scope.setUser(null));
    this.session.invalidate();
  }
}
