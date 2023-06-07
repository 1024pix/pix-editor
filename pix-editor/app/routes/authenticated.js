import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service config;
  @service session;
  @service currentData;
  @service store;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
    await this.config.load();

    if (transition.isAborted) {
      return;
    }
  }

  async model() {
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
