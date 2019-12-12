import Component from '@ember/component';
import {computed} from "@ember/object";
import {inject as service} from '@ember/service';

export default Component.extend({
  config:service(),
  access:service(),
  classNames:['ui', 'borderless', 'bottom', 'attached', 'labelled', 'icon', 'menu'],
  classNameBindings:['hiddenClass', 'skillClass'],
  hiddenClass:computed('hidden', function(){
    return this.get('hidden')?'hidden':'';
  }),
  skillClass:computed('section', function(){
    return (this.get('section') === 'skills')?'skill-mode':'';
  }),
  displayWorkbenchViews:computed('section', 'view', function() {
    const section = this.get('section');
    const view = this.get('view');
    return section === 'challenges' && view !== 'production';
  }),
  displayProductionStats:computed('section', 'view', function() {
    const section = this.get('section');
    const view = this.get('view');
    return section === 'quality' || (section === 'challenges' && view === 'production');
  }),
  mayCreateTube:computed('section', 'config.access', function() {
    return this.get('section') === 'skills' && this.get('access').mayCreateTube();
  }),
  mayCreateTemplate:computed('section', 'view', 'config.access', function() {
    const section = this.get('section');
    const view = this.get('view');
    return section === 'challenges' && (view === 'workbench' || view === 'workbench-list') && this.get('access').mayCreateTemplate();
  })

});
