import Route from '@ember/routing/route';
import {inject as service} from "@ember/service";

export default Route.extend({
  paginatedQuery:service(),
  model(params) {
    return this.get('store').findRecord("competence", params.competence_id);
  },
  afterModel(model) {
    if (model.get('needsRefresh')) {
      return model.hasMany('rawTubes').reload()
      .then(tubes => {
        const getSkills = tubes.map(tube => tube.hasMany('rawSkills').reload());
        return Promise.all(getSkills);
      })
      .then(skillsSet => {
        // TODO: this bugs when a challenge is attached to several skills
        const getChallenges = skillsSet.map( skills => skills.map(skill => skill.hasMany('challenges').reload())).flat();
        return Promise.all(getChallenges);
      })
      .then(() => {
        model.set('needsRefresh', false);
      });
    } else {
      return model.get('rawTubes')
      .then(tubes => {
        const getSkills = tubes.map(tube => tube.get('rawSkills'));
        return Promise.all(getSkills);
      })
      .then(skillsSet => {
        const getChallenges = skillsSet.map( skills => skills.map(skill => skill.get('challenges'))).flat();
        return Promise.all(getChallenges);
      })
    }
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
