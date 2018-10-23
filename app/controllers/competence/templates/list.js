import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';

export default Controller.extend({
  parentController:controller("competence"),
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
