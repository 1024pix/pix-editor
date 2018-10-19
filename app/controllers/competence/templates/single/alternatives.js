import Controller from '@ember/controller';
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { inject as controller } from "@ember/controller";

export default Controller.extend({
  router:service(),
  config:service(),
  application:controller(),
  competenceController:controller("competence"),
  childComponentMaximized:false,
  size:computed("router.currentRouteName", function() {
    if (this.get("router.currentRouteName") == 'competence.templates.single.alternatives.index') {
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
      this.transitionToRoute("competence.templates.single.alternatives.new", this.get("competence"),  this.get("challenge"));
    },
    maximizeChildComponent() {
      this.set("childComponentMaximized", true);
    },
    minimizeChildComponent() {
      this.set("childComponentMaximized", false);
    },
    closeChildComponent() {
      this.set("childComponentMaximized", false);
      this.transitionToRoute("competence.templates.single.alternatives", this.get("competence"), this.get("challenge"));
    },
    copyChallenge(challenge) {
      // TODO: à revoir
      let params = {from: challenge.get("id")};
      if (challenge.get("workbench")) {
        params.workbench=1;
      }
      this.transitionToRoute("competence.templates.single.alternatives.new", this.get("competence"),  this.get("challenge"), { queryParams: params});
    },
    addChallenge(challenge) {
      this.get("challenge.alternatives").addObject(challenge);
      this.set("challengeCount", this.get("challengeCount")+1);
    },
    removeChallenge(challenge) {
      let alternatives = this.get("challenge.alternatives");
      if (alternatives.includes(challenge)) {
        alternatives.removeObject(challenge);
        this.set("challengeCount", this.get("challengeCount")-1);
      }
    },
    refresh() {
      this.get("competenceController").send("refresh");
    }
  }
});
