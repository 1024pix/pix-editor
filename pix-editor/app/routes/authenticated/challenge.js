import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengeRoute extends Route {

  @service router;
  @service store;

  async model(params) {
    try {
      return this.store.findRecord('localized-challenge', params.challenge_id);
    } catch {
      return;
    }
  }

  async afterModel(localizedChallenge) {
    if (!localizedChallenge) {
      return this.router.transitionTo('authenticated');
    }

    try {
      const challenge = await localizedChallenge.challenge;
      const skill = await challenge.get('skill');
      await skill.challenges; // in order to load model.relatedPrototype later on
      const tube = await skill.tube;
      const competence = await tube.competence;
      if (challenge.get('isPrototype') && localizedChallenge.isPrimaryChallenge) {
        return this.router.transitionTo('authenticated.competence.prototypes.single', competence, challenge);
      } else if (challenge.get('isPrototype')) {
        return this.router.transitionTo('authenticated.competence.prototypes.localized', competence, challenge.get('id'), localizedChallenge.get('id'));
      } else if (localizedChallenge.isPrimaryChallenge) {
        return this.router.transitionTo('authenticated.competence.prototypes.single.alternatives.single', competence, challenge.get('relatedPrototype'), challenge);
      } else {
        return this.router.transitionTo('authenticated.competence.prototypes.single.alternatives.localized', competence, challenge.get('relatedPrototype'), challenge.get('id'), localizedChallenge.get('id'));
      }
    } catch (e) {
      this.router.transitionTo('authenticated');
    }
  }
}
