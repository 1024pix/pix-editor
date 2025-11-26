import Route from '@ember/routing/route';
import { service } from '@ember/service';

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
    const [frameworks, areas] = await Promise.all([
      this.store.findAll('framework'),
      this.store.findAll('area'),
      this.store.findAll('competence'),
      this.config.load(),
    ]);
    if (frameworks) {
      this.currentData.setFrameworks(frameworks);
      this.currentData.setAreas(areas);
      const pixFramework = frameworks.find((framework) => framework.name === 'Pix');
      this.currentData.setFramework(pixFramework);
    }
    return frameworks;
  }
}
