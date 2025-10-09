import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengeRoute extends Route {

  @service router;
  @service store;

  beforeModel(transition) {
    const locale = transition.to.queryParams.locale;
    if (!locale) {
      const overview = transition.to.params.overview;
      const skillId = transition.to.params.skill_id;
      // TODO si pas de locale transition vers challenge
    }
  }

  async model(params) {
    const { locale, competence_id } = this.paramsFor('authenticated.v2');
    const { overview, skill_id } = params;
    const competence = this.store.findRecord('competence', competence_id);
    const skill = await this.store.findRecord('skill', skill_id, { backgroundReload: false });
    const challenges = await skill.hasMany('challengesProduction').load();
    const challengeLocales = await Promise.all(
      challenges
        .filter((challenge) => challenge.locales.includes(locale) || challenge.locales.includes('fr'))
        .sort(byAlternativeVersion)
        .map((challenge) => challenge.getChallengeForLocale(locale)),
    );
    return { challengeLocales, competence, overview, skill };
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
