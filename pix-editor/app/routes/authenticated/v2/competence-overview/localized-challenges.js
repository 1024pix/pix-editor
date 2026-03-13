import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LocalizedChallengesRoute extends Route {
  @service router;
  @service store;
  @service versionManager;
  @service multipanelManager;

  beforeModel(transition) {
    const locale = transition.to.queryParams.locale;
    if (!locale) {
      this.router.transitionTo('authenticated.v2.competence-overview.challenges', transition.to.params.skill_id);
    }
  }

  async model(params) {
    const { locale, competence } = this.modelFor('authenticated.v2');
    const { overview } = this.paramsFor('authenticated.v2.competence-overview');
    const { skill_id } = params;
    const skill = await this.store.findRecord('skill', skill_id);
    const challenges = await skill.challengesProduction;

    const challengeLocales = await Promise.all(
      challenges
        .filter((challenge) => challenge.locales.includes(locale) || challenge.locales.includes('fr'))
        .sort(byAlternativeVersion)
        .map((challenge) => challenge.getChallengeForLocale(locale)),
    );

    return {
      challengeLocales,
      skill,
      competence,
      overview,
      locale,
    };
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
