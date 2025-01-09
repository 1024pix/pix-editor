import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengeRoute extends Route {

  @service router;
  @service store;

  async model(params) {
    const { challenge_id, overview, skill_id } = params;
    const skill = await this.store.findRecord('skill', skill_id, { backgroundReload: false });
    const challenges = await skill.hasMany('challengesProduction').load();
    const challenge = await this.store.findRecord('challenge', challenge_id);
    await challenge.files;
    return { challenge, challenges, overview, skill };
  }
}
