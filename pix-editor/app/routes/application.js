import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';

export default class ApplicationRoute extends Route {
  configured = false;

  @service config;
  @service pixConnector;
  @service currentData;

  _openLoginForm() {
    this.controller.send('openLoginForm');
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
      return this.store.findAll('area');
    }
  }

  afterModel(model) {
    if (this.configured) {
      this.pixConnector.connect();
    }
    if (model) {
      this.currentData.setAreas(model);
      const getCompetences = model.map((area => area.competences));
      return Promise.all(getCompetences)
        .then(competences => {
          const sources = model.map(area => area.source);
          this.currentData.setSources([...new Set(sources)]);
          this.currentData.setSource('Pix');
          return competences;
        });
    }
  }

  @action
  loading(transition) {
    const controller = this.controller;
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
