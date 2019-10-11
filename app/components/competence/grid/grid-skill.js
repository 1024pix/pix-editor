import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
  tagName: "",
  skillLink: computed("link", "view", "production", "skill.productionTemplate", function () {
    const view = this.get('view');
    const production = this.get("production");
    const link = this.get("link");
    const template = this.get("skill.productionTemplate");
    if (view === 'skills' || view === 'quality') {
      return "competence.skill.index";
    }
    if (production && template) {
      return link;
    }
    return "competence.templates.list";
  }),
  skillLinkElement: computed("view", "production", "skill.productionTemplate", function () {
    const view = this.get('view');
    const production = this.get("production");
    const template = this.get("skill.productionTemplate");
    if (view === 'skills') {
      return this.get("skill");
    }
    if (view === 'quality' && template) {
      return this.get("skill");
    }
    if (production && template) {
      return template;
    }
    return this.get("skill");
  })
});
