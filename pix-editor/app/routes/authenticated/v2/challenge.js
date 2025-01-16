import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengeRoute extends Route {

  @service router;
  @service store;

  async model(params) {
    const { competence_id: competenceId } = this.paramsFor('authenticated.v2');
    const { challenge_id, overview, skill_id } = params;
    const skill = await this.store.findRecord('skill', skill_id, { backgroundReload: false });
    const challenges = await skill.hasMany('challengesProduction').load();
    const challenge = await this.store.findRecord('challenge', challenge_id);
    await challenge.files;
    return { challenge, challenges, competenceId, overview, skill };
  }
}
