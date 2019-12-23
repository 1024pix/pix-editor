import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from "@ember/object";

export default Component.extend({
  classNames: ['ui', 'main-title'],
  classNameBindings: ['liteClass'],
  config: service(),
  liteClass: computed('config.lite', function () {
    const lite = this.get('config.lite');
    return lite ? 'lite' : '';
  }),
  selectedSection: computed('section', function () {
    const section = this.get('section');
    const selectedItem = this.get('sections').filter(el=>el.id === section);
    return selectedItem[0];
  }),
  init() {
    this._super(...arguments);
    this.sections = [{
      title: 'Epreuves',
      id: 'challenges'
    }, {
      title: 'Acquis',
      id: 'skills'
    }, {
      title: 'Qualité',
      id: 'quality'
    }];
  },
  actions: {
    selectView(view) {
      this.get('selectSection')(view);
    }
  }
});
