import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model(params) {
    return RSVP.hash({
      production:this.get("store").query("challenge", {filterByFormula:"AND(FIND('"+params.challenge_id+"', RECORD_ID()) , Statut != 'archive')", maxRecords:1}),
      workbench:this.get("store").query("workbenchChallenge", {filterByFormula:"AND(FIND('"+params.challenge_id+"', RECORD_ID()) , Statut != 'archive')", maxRecords:1})
    })
    .then(challenges => {
      if (challenges.production.get("length")>0) {
        return this.getTemplateInfo(challenges.production.get("firstObject"));
      } else if (challenges.workbench.get("length")>0) {
        return this.getAlternativeInfo(challenges.workbench.get("firstObject"));
      } else {
        return Promise.resolve(false);
      }
    });
  },
  afterModel(model) {
    if (model.templateId && model.competenceId) {
      if (model.alternativeId) {
        this.transitionTo("competence.challenge.alternatives.alternative", model.competenceId, model.templateId, model.alternativeId);

      } else {
        this.transitionTo("competence.challenge", model.competenceId, model.templateId);
      }
    } else {
      this.transitionTo("index");
    }
  },
  getTemplateInfo(template) {
    let templateId = template.get("id");
    let skills = template.get("skills");
    if (skills.length >0) {
      return this.get("store").findRecord("skill", skills[0])
      .then((skill) => {
        return {
          templateId:templateId,
          competenceId:skill.get("competence")[0]
        }
      });
    } else {
      return  {
        templateId:templateId,
        competenceId:template.get("competence")[0]
      }
    }
  },
  getAlternativeInfo(alternative) {
    let alternativeId = alternative.get("id");
    let competenceId = false;
    let skills = alternative.get("skills");
    return this.get("store").findRecord("workbenchSkill", skills[0])
    .then(workbenchSkill => {
      return this.get("store").findRecord("skill", workbenchSkill.get("skillId"));
    })
    .then(productionSkill => {
      competenceId = productionSkill.get("competence")[0];
      //TODO: check challenge version to get the right template
      return this.get("store").query("challenge", {filterByFormula:"AND(OR(RECORD_ID() = '"+productionSkill.get("challengeIds").join("',RECORD_ID() ='")+"'), {Généalogie} = 'Prototype 1', Statut != 'archive')"});
    })
    .then(challenges => {
      let template = challenges.get("firstObject");
      return {
        templateId:template.get("id"),
        alternativeId:alternativeId,
        competenceId:competenceId
      }
    });
  }
});
