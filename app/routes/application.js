import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';

export default Route.extend({
  configured:false,
  config:service(),
  pixConnector:service(),
  _openConfiguration() {
    this.controller.send('openConfiguration');
  },
  beforeModel() {
    if (this.get('config.check')) {
      this.set('configured', true);
    } else {
      this.set('configured', false);
      scheduleOnce('afterRender', this, this._openConfiguration);
    }
  },
  model() {
    if (this.get('configured')) {
      let store = this.get('store');
      return store.findAll('area');
    }
  },
  afterModel(model) {
    if (this.get('configured')) {
      this.get('pixConnector').connect();
    }
    if (model) {
      const getCompetences = model.map((area => area.get('competences')));
      return Promise.all(getCompetences);
    }
  },
  actions:{
    loading(transition) {
      let controller = this.controller;
      if (controller) {
        controller.set('loading', true);
        transition.promise.finally(function() {
          controller.set('loading', false);
        });
        return false;
      } else {
        return true;
      }
    },
    refresh() {
      this.refresh();
    }
  }
});
