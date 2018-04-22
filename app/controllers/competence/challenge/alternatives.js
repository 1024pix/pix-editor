import Controller from '@ember/controller';
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { inject as controller } from "@ember/controller";
import { alias } from "@ember/object/computed";

export default Controller.extend({
  router:service(),
  application:controller(),
  childComponentMaximized:false,
  alternatives:alias("challenge.alternatives"),
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
