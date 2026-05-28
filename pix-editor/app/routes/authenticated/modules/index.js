import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModulesRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  @service router;

  redirect() {
    this.router.transitionTo('authenticated.modules.workbench');
  }
}
