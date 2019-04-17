import Controller from '@ember/controller';
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import { inject as controller } from "@ember/controller";

export default Controller.extend({
  router:service(),
  config:service(),
  access:service(),
  application:controller(),
  competenceController:controller("competence"),
  childComponentMaximized:false,
  mayCreateAlternative:computed("config.access", function() {
    return this.get("access").mayCreateAlternative();
  }),
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
      this.transitionToRoute("competence.templates.single.alternatives.new", this.get("competence"),  this.get("challenge"), { queryParams: {from: challenge.get("id")}});
    },
    refresh() {
      this.get("competenceController").send("refresh");
    },
    switchDraft() {
      // does nothing
    },
    switchProduction() {
      // does nothing
    }
  }
});
