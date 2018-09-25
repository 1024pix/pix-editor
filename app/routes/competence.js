import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import {inject as service} from "@ember/service";

export default Route.extend({
  paginatedQuery:service(),
  model(params) {
    //let competence;
    let store = this.get("store");
    return store.findRecord("competence", params.competence_id);
    /*.then(data => {
      competence = data;
      // get skills
      return store.query("skill", {filterByFormula:"FIND('"+competence.get("code")+"', {Compétence})", sort: [{field: "Nom", direction: "asc"}]});
    })
    .then(data => {
      competence.set("skills", data);
      let idsFormula = "OR({Acquis prod} = '"+competence.get("skillIds").join("',{Acquis prod} ='")+"')";
      // get workbench skills
      return store.query("workbenchSkill", {filterByFormula:idsFormula});
    })
    .then(data => {
      competence.set("workbenchSkills", data);
      // get challenges linked to skills
      let recordsText = "OR(RECORD_ID() = '"+competence.get("productionChallengeIds").join("',RECORD_ID() ='")+"')";
      let bySkillFilter = "AND("+recordsText+", Statut != 'archive')";

      // get challenges linked to workbench skills
      let workbenchRecordsText = "OR(RECORD_ID() = '"+competence.get("workbenchChallengeIds").join("',RECORD_ID() ='")+"')";
      //TODO: replace Décliné 1 by generic "alternate" status
      let byWorkbenchSkillFilter = "AND("+workbenchRecordsText+", Statut != 'archive', {Généalogie} = 'Décliné 1')";

      // get challenges linked to competence
      let byCompetenceFilter = "AND(FIND('"+competence.get("code")+"', competences) , Statut != 'archive', Acquix = BLANK(), {Généalogie} = 'Prototype 1')";

      let pq = this.get("paginatedQuery");
      return RSVP.hash({
        bySkillProd: pq.query("challenge", {filterByFormula:bySkillFilter}),
        byCompetenceProd: pq.query("challenge", {filterByFormula:byCompetenceFilter}),
        bySkillWorkbench: pq.query("workbenchChallenge", {filterByFormula:byWorkbenchSkillFilter})
      });
    })
    .then(data => {
      competence.set("sortedChallenges", {production:data.bySkillProd, workbench:data.bySkillWorkbench, noSkill: data.byCompetenceProd});
      return competence;
    });*/
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set("childComponentMaximized", false);
    controller.set("challengeCount", model.get("challengeCount"));
  },
  actions: {
    refreshModel() {
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
                this.transitionTo("competence.challenge", competence, challenge);
              } else {
                let skills = competence.get("skills");
                let skill = skills.filter((skill) => {
                  return skill.get("challenges").includes(challenge);
                });
                if (skill.length > 0  && skill[0].template) {
                  this.transitionTo("competence.challenge.alternatives.alternative", competence, skill[0].template, challenge);
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
