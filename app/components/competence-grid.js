import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {computed} from '@ember/object';

export default Component.extend({
  classNames:["competence-grid"],
  classNameBindings: ["hidden"],
  access:service(),
  config:service(),
  mayAddSkill:computed("config.access", function() {
    return this.get("access").mayEditSkills();
  })
});
