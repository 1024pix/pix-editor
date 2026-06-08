import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ChallengeRoute extends Route {
  @service router;
  @service store;

  beforeModel(transition) {
    const locale = transition.to.queryParams.locale;

    if (!locale) {
      const { competence_id: competenceId } = this.paramsFor('authenticated.v2');
      const { skill_id: skillId } = this.paramsFor('authenticated.v2.competence-overview.localized-challenges');
      const { overview } = this.paramsFor('authenticated.v2.competence-overview');

      this.router.transitionTo('authenticated.v2.competence-overview.challenges', competenceId, overview, skillId);
    }
  }

  async model(params) {
    const { localized_challenge_id } = params;
    const { challengeLocales, skill, competence, overview, locale } = this.modelFor(
      'authenticated.v2.competence-overview.localized-challenges',
    );

    const challengeLocale = challengeLocales.find(
      (challengeLocale) => challengeLocale?.localizedChallengeValue?.id === localized_challenge_id,
    );

    if (!challengeLocale) {
      return this.router.transitionTo(
        'authenticated.v2.competence-overview.challenges',
        competence.id,
        overview,
        skill.id,
      );
    }

    const localizedChallenge = challengeLocale.localizedChallengeValue;
    await challengeLocale.challenge.attachments;
    await localizedChallenge.attachments;
    return { challengeLocale, localizedChallenge, challengeLocales, competence, overview, skill };
  }

  @action
  async willTransition(transition) {
    const edition = this.controllerFor(
      'authenticated.v2.competence-overview.localized-challenges.localized-challenge',
    ).edition;
    if (edition && !transition.to.find((route) => route.name === this.routeName)) {
      if (confirm("Êtes vous sur de vouloir quitter l'edition de l'épreuve?")) {
        this.controllerFor(
          'authenticated.v2.competence-overview.localized-challenges.localized-challenge',
        ).cancelEdit();
        const { localizedChallenge } = this.controllerFor(
          'authenticated.v2.competence-overview.localized-challenges.localized-challenge',
        ).model;
        await rollBack(localizedChallenge);
      } else {
        transition.abort();
      }
    }
  }
}

async function rollBack(localizedChallenge) {
  const attachments = await localizedChallenge.attachments;
  attachments.forEach((attachment) => attachment.rollbackAttributes());
  localizedChallenge.rollbackAttributes();
}

function byAlternativeVersion(challengeA, challengeB) {
  if (challengeA.isPrototype) {
    return -1;
  }
  if (challengeB.isPrototype) {
    return 1;
  }
  return challengeA.alternativeVersion - challengeB.alternativeVersion;
}
