import Route from '@ember/routing/route';
import { service } from '@ember/service';

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
      await skill.challenges; // in order to use model.relatedPrototype later on
      const tube = await skill.tube;
      const competence = await tube.competence;
      const prototype = challenge.get('isPrototype') ? challenge : challenge.get('relatedPrototype');

      if (this.versionManager.isV2 && prototype?.get('isValidated')) {
        if (localizedChallenge.isPrimaryChallenge) {
          return this.router.transitionTo(
            'authenticated.v2.challenge',
            competence.get('id'),
            'challenges-production',
            skill.get('id'),
            challenge.get('id'),
          );
        }

        return this.router.transitionTo(
          'authenticated.v2.localized-challenge',
          competence.get('id'),
          'challenges-production',
          skill.get('id'),
          localizedChallenge.id,
          { queryParams: { locale: localizedChallenge.locale } },
        );
      }

      if (challenge.get('isPrototype')) {
        if (localizedChallenge.isPrimaryChallenge) {
          return this.router.transitionTo(
            'authenticated.competence.prototypes.single',
            competence.get('id'),
            challenge.get('id'),
            { queryParams: { view: challenge.get('isValidated') ? 'production' : 'workbench' } },
          );
        }

        return this.router.transitionTo(
          'authenticated.competence.prototypes.localized',
          competence.get('id'),
          challenge.get('id'),
          localizedChallenge.get('id'),
        );
      }

      if (localizedChallenge.isPrimaryChallenge) {
        return this.router.transitionTo(
          'authenticated.competence.prototypes.single.alternatives.single',
          competence.get('id'),
          prototype.get('id'),
          challenge.get('id'),
          { queryParams: { view: prototype.get('isValidated') ? 'production' : 'workbench' } },
        );
      }

      return this.router.transitionTo(
        'authenticated.competence.prototypes.single.alternatives.localized',
        competence.get('id'),
        prototype.get('id'),
        challenge.get('id'),
        localizedChallenge.get('id'),
      );
    } catch {
      this.router.transitionTo('authenticated');
    }
  }
}
