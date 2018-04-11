import Controller from '@ember/controller';
import { computed } from "@ember/object";
import { A } from "@ember/array";
import { inject as service } from "@ember/service";
import { inject as controller } from "@ember/controller";

export default Controller.extend({
  router:service(),
  application:controller(),
  listHidden:false,
  size:computed("router.currentRouteName", function() {
    if (this.get("router.currentRouteName") == 'competence.challenge.alternatives') {
      return "full";
    } else {
      return "half";
    }
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
    }
  }
});
