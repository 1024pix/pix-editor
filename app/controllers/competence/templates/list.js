import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import {computed} from "@ember/object";

export default Controller.extend({
  parentController:controller("competence"),
  access:service(),
  config:service(),
  mayCreateTemplate:computed("config.access", function() {
    return this.get("access").mayCreateTemplate;
  }),
  actions: {
    close() {
      this.get("parentController").send("closeChildComponent");
    },
    newVersion() {
      return this.get("model.sortedTemplates")
      .then(templates => {
        if (templates.length>0) {
          let template = templates.get("firstObject");
          this.transitionToRoute("competence.templates.new", this.get("competence"), { queryParams: { from: template.get("id")}});
        } else {
          this.transitionToRoute("competence.templates.new", this.get("competence"), { queryParams: { fromSkill: this.get("model").get("id")}});
        }
      })
    },
    init() {
      this.get("parentController").send("switchDraft", false);
    }
  }
});
