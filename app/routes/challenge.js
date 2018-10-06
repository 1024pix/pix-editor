import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    //TODO: à améliorer
    let set = {templateId:false, alternativeId:false, competenceId:false};
    return this.get("store").query("challenge", {filterByFormula:"AND(FIND('"+params.challenge_id+"', RECORD_ID()) , Statut != 'archive')", maxRecords:1})
    .then(result => {
      if (result.get("length")>0) {
        let challenge = result.get("firstObject");
        if (challenge.get("template")) {
          set.templateId = challenge.get("id");
        } else {
          set.alternativeId = challenge.get("id");
        }
        let skills = challenge.get("skills");
        if (skills.length >0) {
          return this.get("store").findRecord("skill", skills[0]);
        }
      }
      return Promise.resolve(false);
    })
    .then(skill => {
      if (skill) {
        set.competenceId = skill.get("competence")[0];
        if (set.alternativeId) {
          return this.get("store").query("challenge", {filterByFormula:"AND(OR(RECORD_ID() = '"+skill.get("challengeIds").join("',RECORD_ID() ='")+"'), {Généalogie} = 'Prototype 1', Statut != 'archive')"});
        }
      }
      return Promise.resolve(false);
    })
    .then(result => {
      if (result && result.get("length") > 0) {
        let template = result.get("firstObject");
        set.templateId = template.get("id");
      }
      return set;
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
  }
});
