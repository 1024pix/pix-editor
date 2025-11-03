import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengeRoute extends Route {
  @service router;
  @service store;

  beforeModel(transition) {
    const locale = transition.to.queryParams.locale;
    if (!locale) {
      const { competence_id: competenceId } = this.paramsFor('authenticated.v2');
      const overview = transition.to.params.overview;
      const skillId = transition.to.params.skill_id;

      this.router.transitionTo('authenticated.v2.competence-overview.challenges', competenceId, overview, skillId);
    }
  }

  async model(params) {
    const { locale, competence_id } = this.paramsFor('authenticated.v2');
    const { overview, skill_id, localized_challenge_id } = params;
    const competence = await this.store.findRecord('competence', competence_id);
    const skill = await this.store.findRecord('skill', skill_id, { backgroundReload: false });
    const challenges = await skill.hasMany('challengesProduction').load();

    const challengeLocales = await Promise.all(
      challenges
        .filter((challenge) => challenge.locales.includes(locale) || challenge.locales.includes('fr'))
        .sort(byAlternativeVersion)
        .map((challenge) => challenge.getChallengeForLocale(locale)),
    );
    const challengeLocale = challengeLocales.find((challengeLocale) => challengeLocale?.localizedChallengeValue?.id === localized_challenge_id);
    if (!challengeLocale) {
      return this.router.transitionTo('authenticated.v2.competence-overview.challenges', competence_id, overview, skill_id);
    }
    const localizedChallenge = challengeLocale.localizedChallengeValue;
    await challengeLocale.challenge.attachments;
    await localizedChallenge.attachments;
    return { challengeLocale, localizedChallenge, challengeLocales, competence, overview, skill };
  }
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
