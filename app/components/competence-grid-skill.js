import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName:"",
  skillLink:computed("link", "view", "production", "skill.productionTemplate", function() {
    const view = this.get('view');
    let production = this.get("production");
    let link = this.get("link");
    let template = this.get("skill.productionTemplate");
    if (view === 'skills' || view === 'quality') {
      return "competence.skill.index";
    }
    if (production && template) {
      return link;
    }
    return "competence.templates.list";
  }),
  skillLinkElement:computed("view", "production", "skill.productionTemplate", function() {
    const view = this.get('view');
    let production = this.get("production");
    let template = this.get("skill.productionTemplate");
    if (view === 'skills' || view === 'quality') {
      return this.get("skill");
    }
    if (production && template) {
      return template;
    }
    return this.get("skill");
  })
});
