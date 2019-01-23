import Route from '@ember/routing/route';
import {inject as service} from "@ember/service";

export default Route.extend({
  paginatedQuery:service(),
  model(params) {
    return this.get('store').findRecord("competence", params.competence_id)
  },
  afterModel(model) {
    if (model.get('needsRefresh')) {
      return model.refresh()
      .then(() => {
        model.set('needsRefresh', false);
        return model.get('loaded');
      });
    }
  },
  setupController(controller, model) {
    this._super(...arguments);
    controller.set("childComponentMaximized", false);
    controller.set("challengeCount", model.get("challengeCount"));
  },
  actions: {
    refreshModel() {
      let model = this.modelFor(this.routeName);
      model.set('needsRefresh', true);
      this.refresh();
    },
    willTransition(transition) {
      try {
        if (transition.targetName === "challenge") {
          let challengeId = transition.params.challenge.challenge_id;
          let competence = this.modelFor("competence");
          let productionIds = competence.get("productionChallengeIds");
          if (productionIds.includes(challengeId)) {
            let challenge = this.get("store").peekRecord("challenge", challengeId);
            if (challenge) {
              if (challenge.template) {
                this.transitionTo("competence.templates.single", competence, challenge);
              } else {
                let skills = competence.get("skills");
                let skill = skills.filter((skill) => {
                  return skill.get("challenges").includes(challenge);
                });
                if (skill.length > 0  && skill[0].template) {
                  this.transitionTo("competence.templates.single.alternatives.single", competence, skill[0].template, challenge);
                }
              }
            }
          }
        }
      }
      catch(error) {
        // do nothing
      }
      return true;
    }
  }
});
