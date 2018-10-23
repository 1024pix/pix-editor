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
    newTemplate() {
      console.log("todo");
    },
    init() {
      this.get("parentController").send("switchDraft", false);
    }
  }
});
