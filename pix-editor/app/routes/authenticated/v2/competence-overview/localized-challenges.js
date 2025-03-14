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
    const { competence_id: competenceId } = this.paramsFor('authenticated.v2');
    const { overview } = this.paramsFor('authenticated.v2.competence-overview');
    const { locale } = this.paramsFor('authenticated.v2');
    const { skill_id } = params;
    const skill = await this.store.findRecord('skill', skill_id);
    const challenges = await skill.challengesProduction;
    const localizedChallenges = await skill.localizedChallengesProduction;

    return { challenges, skill, localizedChallenges, locale, competenceId, overview };
  }
}
