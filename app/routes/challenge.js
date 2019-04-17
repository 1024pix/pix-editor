import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    return this.get('store').query('challenge', {filterByFormula:`AND(FIND('${params.challenge_id}', RECORD_ID()) , Statut != 'archive')`, maxRecords:1})
    .then(challenges => {
      return challenges.get('firstObject');
    });
  },
  afterModel(model) {
    if (model) {
      return model.get('firstSkill')
      .then(skill => skill.get('tube'))
      .then(tube => tube.get('competence'))
      .then(competence => {
        if (model.get('isTemplate')) {
          return this.transitionTo('competence.templates.single', competence, model);
        } else {
          return model.get('template')
          .then(template => this.transitionTo('competence.templates.single.alternatives.single', competence, template, model))
        }
      })
      .catch(() => this.transitionTo("index"));
    } else {
      return this.transitionTo("index");
    }
  }
});
