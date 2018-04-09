import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';

export default Route.extend({
  configured:false,
  config:service(),
  pixConnector:service(),
  beforeModel() {
    if (this.get("config").check()) {
      this.set("configured", true);
    } else {
      this.set("configured", false);
      scheduleOnce('afterRender', this, function() {
        this.controller.send("openConfiguration");
      });
    }
  },
  model() {
    if (this.get("configured")) {
      let areas;
      let store = this.get('store');
      return store.findAll('area')
      .then(data => {
        areas = data;
        return store.findAll('competence');
      })
      .then(competences => {
        areas.forEach(area => {
          let ids = area.get('competenceIds');
          area.set('competences', competences.filter(competence => {
            return ids.includes(competence.id);
          }));
        })
        return areas;
      });
    }
  },
  afterModel() {
    if (this.get("configured")) {
      this.get("pixConnector").connect();
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
