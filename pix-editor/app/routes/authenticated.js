import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service config;
  @service session;
  @service currentData;
  @service store;

  beforeModel(transition) {
    console.log('authenticated beforemodel');
    this.session.requireAuthentication(transition, 'login');
    if (transition.isAborted) return;
  }

  async model() {
    await this.config.load();
    return this.store.findAll("framework");
  }

  async afterModel(model) {
    if (model) {
      const areas = [];
      for (const framework of model.toArray()) {
        const frameworkAreas = await framework.areas;
        areas.push(...frameworkAreas.toArray());
      }
      this.currentData.setAreas(areas);
      this.currentData.setFrameworks(model);
      const pixFramework = model.find((framework) => framework.name === "Pix");
      this.currentData.setFramework(pixFramework);
      const areasFromFramework = await Promise.all(
        model.map((framework) => framework.areas)
      );
      return areasFromFramework.map((areas) =>
        areas.map((area) => area.competences)
      );
    }
  }
}
