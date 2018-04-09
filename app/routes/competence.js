import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import {inject as service} from "@ember/service";

export default Route.extend({
  paginatedQuery:service(),
  model(params) {
    let competence, skills, workbenchChallengeIdsBySkill, challenges;
    let store = this.get("store");
    return store.findRecord("competence", params.competence_id)
    .then(data => {
      competence = data;
      // get skills
      return store.query("skill", {filterByFormula:"FIND('"+competence.get("code")+"', {Compétence})", sort: [{field: "Nom", direction: "asc"}]});
    })
    .then(data => {
      skills = data;
      competence.set("skills", skills);
      let skillIds = skills.reduce((current, skill) => {
        current.push(skill.get("id"));
        return current;
      }, []);
      let idsFormula = "OR({Acquis prod} = '"+skillIds.join("',{Acquis prod} ='")+"')";
      // get workbench skills
      return store.query("workbenchSkill", {filterByFormula:idsFormula});
    })
    .then(data => {
      // get challenges linked to skills
      let challengeIds = skills.reduce((current, skill) => {
        return current.concat(skill.get("challengeIds"));
      }, []);
      let recordsText = "OR(RECORD_ID() = '"+challengeIds.join("',RECORD_ID() ='")+"')";
      let bySkillFilter = "AND("+recordsText+", Statut != 'archive')";

      // get challenges linked to workbench skills
      workbenchChallengeIdsBySkill = data.reduce((current, workbenchSkill) => {
        let challengeIds = workbenchSkill.get("challengeIds");
        if (challengeIds) {
          current[workbenchSkill.get("skillId")] = challengeIds;
        }
        return current;
      }, {});

      let workbenchChallengeIds = Object.values(workbenchChallengeIdsBySkill).reduce((current, ids) => {
        return current.concat(ids);
      }, []);

      let workbenchRecordsText = "OR(RECORD_ID() = '"+workbenchChallengeIds.join("',RECORD_ID() ='")+"')";
      //TODO: replace Décliné 1 by generic "alternate" status
      let byWorkbenchSkillFilter = "AND("+workbenchRecordsText+", Statut != 'archive', {Généalogie} = 'Décliné 1')";

      // get challenges linked to competence
      let byCompetenceFilter = "AND(FIND('"+competence.get("code")+"', competences) , Statut != 'archive', Acquix = BLANK())";

      let pq = this.get("paginatedQuery");
      return RSVP.hash({
        bySkillProd: pq.query("challenge", {filterByFormula:bySkillFilter}),
        byCompetenceProd: pq.query("challenge", {filterByFormula:byCompetenceFilter}),
        bySkillWorkbench: pq.query("workbenchChallenge", {filterByFormula:byWorkbenchSkillFilter})
      });
    })
    .then(data => {
      const skillChallenges = data.bySkillProd;
      const workbenchChallenges = data.bySkillWorkbench;
      let orderedChallenges = skillChallenges.reduce((current, challenge) => {
        current[challenge.get("id")] = challenge;
        return current;
      }, {});
      let orderedWorkbenchChallenges = workbenchChallenges.reduce((current, challenge) => {
        current[challenge.get("id")] = challenge;
        return current;
      }, {});
      skills.forEach((skill) => {
        let template = null;
        let alternativeCount = 0;
        let ids = skill.get("challengeIds");
        if (ids) {
          let set = ids.reduce((current, id) => {
            if (orderedChallenges[id]) {
              current.push(orderedChallenges[id]);
              if (orderedChallenges[id].get("template") && (!template || orderedChallenges[id].get("validated"))) {
                template = orderedChallenges[id];
              } else {
                alternativeCount++;
              }
            }
            return current;
          }, []);
          skill.set("challenges", set);
          if (template) {
            skill.set("template", template);
          }
          skill.set('alternativeCount', alternativeCount);
          if (workbenchChallengeIdsBySkill[skill.get("id")]) {
            let set = workbenchChallengeIdsBySkill[skill.get("id")].reduce((current, id) => {
              if (orderedWorkbenchChallenges[id]) {
                current.push(orderedWorkbenchChallenges[id]);
              }
              return current;
            }, []);
            skill.set("workbenchChallenges", set);
          }
        }
      })
      challenges = data.byCompetenceProd.reduce((current, value) => {
        current.push(value);
        return current;
      }, Object.values(orderedChallenges));
      // Todo link challenges to competence
      return {
        competence:competence,
        challenges:challenges,
        workbenchChallenges:workbenchChallenges
      }
    });
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set("challengeMaximized", false);
  },
  actions: {
    refreshModel() {
      this.refresh();
    }
  }
});
