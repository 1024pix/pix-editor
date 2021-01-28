import Route from '@ember/routing/route';

export default class ChallengeRoute extends Route {
  model(params) {
    return this.store.query('challenge', { filterByFormula:`AND(FIND('${params.challenge_id}', {id persistant}))`, maxRecords: 1 })
      .then(challenges => {
        return challenges.firstObject;
      });
  }

  afterModel(model) {
    if (model) {
      return model.skills
        .then(() => {
          const firstSkill = model.firstSkill;
          return firstSkill.challenges // in order to load model.relatedPrototype later on
            .then(() => firstSkill.tube);
        })
        .then(tube => tube.competence)
        .then(competence => {
          if (model.isPrototype) {
            return this.transitionTo('competence.prototypes.single', competence, model);
          } else {
            return this.transitionTo('competence.prototypes.single.alternatives.single', competence, model.relatedPrototype, model);
          }
        })
        .catch(() => this.transitionTo('index'));
    } else {
      return this.transitionTo('index');
    }
  }
}
