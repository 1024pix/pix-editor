import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengesRoute extends Route {
  @service store;
  @service router;

  beforeModel(transition) {
    const locale = transition.to.queryParams.locale;
    if (locale) {
      this.router.transitionTo('authenticated.v2.competence-overview.localized-challenges', transition.to.params.skill_id);
    }
  }

  async model(params) {
    const skill = await this.store.findRecord('skill', params.skill_id);
    const challenges = await skill.challengesProduction;

    return { challenges, skill };
  }
}
