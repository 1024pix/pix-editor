import Component from '@ember/component';
import {inject as service} from '@ember/service';
import {computed} from "@ember/object";

export default Component.extend({
  classNames:['ui', 'main-title'],
  classNameBindings:['liteClass'],
  config: service(),
  liteClass:computed('config.lite', function() {
    const lite = this.get('config.lite');
    return lite?'lite':'';
  }),
  init() {
    this._super(...arguments);
    this.mainViews = [{
      title: 'Epreuves',
      id: 'challenges'
    }, {
      title: 'Acquis',
      id: 'skills'
    }, {
      title: 'Qualité',
      id: 'quality'
    }];
  }
});
