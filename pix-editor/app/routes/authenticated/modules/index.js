import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModulesIndexRoute extends Route {
  @service router;
  @service access;

  redirect() {
    const params = this.access.mayCreateOrEditModule() ? 'workbench' : 'production';
    this.router.transitionTo(`authenticated.modules.${params}`);
  }
}
