import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service config;
  @service session;
  @service currentData;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    if (transition.isAborted) return;
  }

  async model() {
    await this.config.load();
    const frameworks = await this.store.findAll('framework');
    if (frameworks) {
      const frameworksAreas = await Promise.all(frameworks.toArray().map((framework) => framework.areas));
      const areas = frameworksAreas.flatMap((frameworkAreas) => frameworkAreas.toArray());
      this.currentData.setAreas(areas);
      this.currentData.setFrameworks(frameworks);
      const pixFramework = frameworks.find((framework) => framework.name === 'Pix');
      this.currentData.setFramework(pixFramework);
    }
    return frameworks;
  }

}
