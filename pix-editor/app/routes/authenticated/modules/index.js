import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModulesIndexRoute extends Route {
  @service router;

  redirect() {
    this.router.transitionTo('authenticated.modules.workbench');
  }
}
