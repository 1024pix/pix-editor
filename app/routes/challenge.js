import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get("store").query("challenge", {filterByFormula:"AND(FIND('"+params.challenge_id+"', RECORD_ID()) , Statut != 'archive')", maxRecords:1})
    .then(challenges => {
      return challenges.get('firstObject');
    });
  },
  afterModel(model) {
    let competenceId = null;
    if (model) {
      return model.get('skills')
      .then(skills => {
        return skills.get('firstObject');
      })
      .then(skill => {
        if (skill) {
          competenceId = skill.get('competence')[0];
          return model.get('template');
        } else {
          return Promise.resolve(null);
        }
      })
      .then(template => {
        if (competenceId !== null) {
          if (template) {
            return this.transitionTo("competence.templates.single.alternatives.single", competenceId, template.get('id'), model.get('id'));
          } else {
            return this.transitionTo("competence.templates.single", competenceId, model.get('id'));
          }
        } else {
          return this.transitionTo("index");
        }
      });
    } else {
      this.transitionTo("index");
    }
  }
});
