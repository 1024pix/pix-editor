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
      return model.get('skills')
      .then(() => {
        const firstSkill = model.get('firstSkill');
        return firstSkill.get('challenges') // in order to load model.template later on
        .then(() => firstSkill.get('tube'));
      })
      .then(tube => tube.get('competence'))
      .then(competence => {
        if (model.get('isTemplate')) {
          return this.transitionTo('competence.templates.single', competence, model);
        } else {
          return this.transitionTo('competence.templates.single.alternatives.single', competence, model.get('template'), model);
        }
      })
      .catch(() => this.transitionTo("index"));
    } else {
      return this.transitionTo("index");
    }
  }
});
