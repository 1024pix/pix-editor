import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
    await Promise.all(challenges.map((challenge) => challenge.localizedChallenges));

    const localizedChallenges = challenges
      .filter((challenge) => challenge.locales.includes(locale) || challenge.locales.includes('fr'))
      .sort(byAlternativeVersion)
      .map((challenge) => {
        const isPrimaryInLocale = challenge.locales.includes(locale);
        if (isPrimaryInLocale) {
          return {
            version: challenge.isPrototype ? 'Proto' : challenge.alternativeVersion,
            instruction: challenge.instruction,
            primaryUpdatedAt: challenge.updatedAt,
            primaryAuthor: challenge.author,
            primaryStatus: challenge.status,
            status: challenge.status,
            primaryPreviewUrl: new URL(challenge.preview, window.location).href,
            localizedPreviewUrl: null,
            translationsUrl: null,
            primaryId: challenge.id,
            localizedId: null,
            isNotTranslated: false,
            isPrimaryInLocale,
          };
        }
        const localizedChallenges = challenge.hasMany('localizedChallenges').value();
        const localizedChallengeForLocale = localizedChallenges.find((localizedChallenge) => localizedChallenge.locale === locale);
        return {
          version: challenge.isPrototype ? 'Proto' : challenge.alternativeVersion,
          instruction: localizedChallengeForLocale?.instruction,
          primaryUpdatedAt: challenge.updatedAt,
          primaryAuthor: challenge.author,
          primaryStatus: challenge.status,
          status: localizedChallengeForLocale?.status,
          primaryPreviewUrl: new URL(challenge.preview, window.location).href,
          localizedPreviewUrl: localizedChallengeForLocale ? new URL(`${challenge.preview}?locale=${localizedChallengeForLocale.locale}`, window.location).href : null,
          translationsUrl: isPrimaryInLocale ? null : getTranslationsUrl(locale, competence.areaCode, challenge.id),
          primaryId: challenge.id,
          localizedId: localizedChallengeForLocale?.id,
          isNotTranslated: !!localizedChallengeForLocale,
          isPrimaryInLocale,
        };
      });

    return {
      localizedChallenges,
      skill,
      competenceId: competence.id,
      overview,
    };
  }
}

function getTranslationsUrl(locale, areaCode, challengeId) {
  if (locale === 'fr-fr') return null;
  return `/api/challenges/${challengeId}/translations/${locale}/area-code/${areaCode}`;
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
