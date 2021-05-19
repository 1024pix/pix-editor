import Route from '@ember/routing/route';

export default class ChallengeRoute extends Route {
  async model(params) {
    const challenges = await this.store.query('challenge', {
      filterByFormula:`AND(FIND('${params.challenge_id}', {id persistant}))`,
      maxRecords: 1
    });
    return challenges.firstObject;
  }

  async afterModel(model) {
    if (model) {
      try {
        await model.skills;
        const firstSkill = model.firstSkill;
        await firstSkill.challenges; // in order to load model.relatedPrototype later on
        const tube = await firstSkill.tube;
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
