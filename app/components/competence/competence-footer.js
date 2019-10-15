import Component from '@ember/component';
import {computed} from "@ember/object";
import {inject as service} from '@ember/service';

export default Component.extend({
  config:service(),
  access:service(),
  classNames:['ui', 'borderless', 'bottom', 'attached', 'labelled', 'icon', 'menu'],
  classNameBindings:['hiddenClass', 'skillCkass'],
  hiddenClass:computed('hidden', function(){
    return this.get('hidden')?'hidden':'';
  }),
  skillClass:computed('view', function(){
    return (this.get('view') === 'skills')?'skill-mode':'';
  }),
  displayWorkbenchViews:computed('view', function() {
    const view = this.get('view');
    return view === 'workbench' || view === 'workbench-list';
  }),
  displayProductionStats:computed('view', function() {
    const view = this.get('view');
    return view === 'quality' || view === 'production';
  }),
  mayCreateTube:computed('view', 'config.access', function() {
    return this.get('view') === 'skills' && this.get('access').mayCreateTube();
  }),
  mayCreateTemplate:computed('view', 'config.access', function() {
    const view = this.get('view');
    return (view === 'workbench' || view === 'workbench-list') && this.get('access').mayCreateTemplate();
  })

});
