import Route from '@ember/routing/route';

export default class ChallengeRoute extends Route {
  model(params) {
    return this.store.findRecord('challenge', params.challenge_id);
  }

  async afterModel(model) {
    if (model) {
      try {
        const skill = await model.skill;
        await skill.challenges; // in order to load model.relatedPrototype later on
        const tube = await skill.tube;
        const competence = await tube.competence;
        if (model.isPrototype) {
          return this.transitionTo('competence.prototypes.single', competence, model);
        } else {
          return this.transitionTo('competence.prototypes.single.alternatives.single', competence, model.relatedPrototype, model);
        }
      } catch (e) {
        this.transitionTo('index');
      }
    } else {
      return this.transitionTo('index');
    }
  }
}
