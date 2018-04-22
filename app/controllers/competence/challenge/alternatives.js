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
    },
    copyChallenge(challengeId) {
      this.transitionToRoute("competence.challenge.alternatives.new-alternative", this.get("competence"),  this.get("challenge"), { queryParams: { from: challengeId}});
    },
    addChallenge(challenge) {
      this.get("alternatives").addObject(challenge);
      this.set("challengeCount", this.get("challengeCount")+1);
    },
    removeChallenge(challenge) {
      let alternatives = this.get("alternatives");
      if (alternatives.includes(challenge)) {
        alternatives.removeObject(challenge);
        this.set("challengeCount", this.get("challengeCount")-1);
      }
    }
  }
});
