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
  queryParams:['secondMaximized'],
  secondMaximized:false,
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
  listHidden:computed("secondMaximized", function() {
    return this.get("secondMaximized")?"hidden":"";
  }),
  actions: {
    newAlternative() {
      this.transitionToRoute("competence.templates.single.alternatives.new", this.get("competence"),  this.get("challenge"));
    },
    closeChildComponent() {
      this.set("secondMaximized", false);
      this.transitionToRoute("competence.templates.single.alternatives", this.get("competence"), this.get("challenge"));
    },
    copyChallenge(challenge) {
      this.transitionToRoute("competence.templates.single.alternatives.new", this.get("competence"),  this.get("challenge"), { queryParams: {from: challenge.get("id")}});
    },
    refresh() {
      this.get("competenceController").send("refresh");
    },
    selectView() {
      // does nothing
    }
  }
});
