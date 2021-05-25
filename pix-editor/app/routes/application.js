import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';

export default class ApplicationRoute extends Route {
  configured = false;

  @service config;
  @service currentData;

  _openLoginForm() {
    this.controllerFor('application').send('openLoginForm');
  }

  async beforeModel() {
    try {
      await this.config.load();
      this.configured = true;
    } catch (error) {
      this.configured = false;
    }

    if (!this.configured) {
      scheduleOnce('afterRender', this, this._openLoginForm);
    }
  }

  model() {
    if (this.configured) {
      return this.store.findAll('framework');
    }
  }

  async afterModel(model) {
    if (model) {
      const areas = await Promise.all(model.map(framework => framework.areas.toArray()).flat());
      this.currentData.setAreas(areas);
      const sources = model.map(framework => framework.name);
      this.currentData.setSources(sources);
      this.currentData.setSource('Pix');
      const areasFromFramework = await Promise.all(model.map(framework => framework.areas));
      return areasFromFramework.map(areas => areas.map(area => area.competences));
    }
  }

  @action
  loading(transition) {
    const controller = this.controllerFor('application');
    if (controller) {
      controller.loading = true;
      transition.promise.finally(function () {
        controller.loading = false;
      });
      return false;
    } else {
      return true;
    }
  }
}
