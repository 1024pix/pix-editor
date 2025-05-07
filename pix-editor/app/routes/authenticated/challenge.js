import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengeRoute extends Route {

  @service router;
  @service store;
  @service versionManager;

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
        if (this.versionManager.isV2 && challenge.get('isValidated')) {
          return this.router.transitionTo(
            'authenticated.v2.challenge',
            competence.get('id'),
            'challenges-production',
            skill.get('id'),
            challenge.get('id'),
          );
        } else {
          return this.router.transitionTo(
            'authenticated.competence.prototypes.single',
            competence.get('id'),
            challenge.get('id'),
            { queryParams: { view: challenge.get('isValidated') ? 'production' : 'workbench' } },
          );
        }
      } else if (challenge.get('isPrototype')) {
        return this.router.transitionTo(
          'authenticated.competence.prototypes.localized',
          competence.get('id'),
          challenge.get('id'),
          localizedChallenge.get('id'),
        );
      } else if (localizedChallenge.isPrimaryChallenge) {
        const prototype = challenge.get('relatedPrototype');
        if (this.versionManager.isV2 && prototype.get('isValidated')) {
          return this.router.transitionTo(
            'authenticated.v2.challenge',
            competence.get('id'),
            'challenges-production',
            skill.get('id'),
            challenge.get('id'),
          );
        } else {
          return this.router.transitionTo(
            'authenticated.competence.prototypes.single.alternatives.single',
            competence.get('id'),
            prototype.get('id'),
            challenge.get('id'),
            { queryParams: { view: prototype.get('isValidated') ? 'production' : 'workbench' } },
          );
        }
      } else {
        return this.router.transitionTo(
          'authenticated.competence.prototypes.single.alternatives.localized',
          competence.get('id'),
          challenge.get('relatedPrototype').get('id'),
          challenge.get('id'),
          localizedChallenge.get('id'),
        );
      }
    } catch {
      this.router.transitionTo('authenticated');
    }
  }
}
