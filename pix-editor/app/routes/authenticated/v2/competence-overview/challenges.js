import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengesRoute extends Route {

  @service store;

  async model(params) {
    const skill = await this.store.findRecord('skill', params.skill_id);
    const challenges = await skill.challengesProduction;

    return { challenges, skill };
  }
}
