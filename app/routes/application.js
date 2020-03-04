import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';

export default class ApplicationRoute extends Route {
  configured = false;

  @service config;
  @service pixConnector;

  _openConfiguration() {
    this.controller.send('openConfiguration');
  }

  beforeModel() {
    if (this.config.check) {
      this.configured = true;
    } else {
      this.configured = false;
      scheduleOnce('afterRender', this, this._openConfiguration);
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
      const getCompetences = model.map((area => area.competences));
      return Promise.all(getCompetences);
    }
  }

  @action
  loading(transition) {
    let controller = this.controller;
    if (controller) {
      controller.loading = true;
      transition.promise.finally(function() {
        controller.loading = false;
      });
      return false;
    } else {
      return true;
    }
  }
}
