import Controller from '@ember/controller';
import { computed } from "@ember/object";
import { A } from "@ember/array";
import { inject as service } from "@ember/service";
import { inject as controller } from "@ember/controller";

export default Controller.extend({
  router:service(),
  application:controller(),
  childComponentMaximized:false,
  size:computed("router.currentRouteName", function() {
    if (this.get("router.currentRouteName") == 'competence.challenge.alternatives.index') {
      return "full";
    } else {
      return "half";
    }
  }),
  listHidden:computed("childComponentMaximized", function() {
    return this.get("childComponentMaximized")?"hidden":"";
  }),
  alternatives:computed("challenge", function() {
    let challenge = this.get("challenge");
    let alternatives = challenge.get("alternatives");
    let productionAlternatives = alternatives.production.toArray();
    let workbenchAlternatives = alternatives.workbench.toArray();
    let result = new A();
    result.pushObjects(productionAlternatives);
    result.pushObjects(workbenchAlternatives);
    return result;
  }),
  actions: {
    newAlternative() {
      this.get("application").send("showMessage", "Bientôt disponible...", true);
    },
    maximizeChildComponent() {
      this.set("childComponentMaximized", true);
    },
    minimizeChildComponent() {
      this.set("childComponentMaximized", false);
    },
    closeChildComponent() {
      this.set("childComponentMaximized", false);
      this.transitionToRoute("competence.challenge.alternatives", this.get("competence"), this.get("challenge"));
    }
  }
});
