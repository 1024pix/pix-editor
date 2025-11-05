import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengeRoute extends Route {
  @service router;
  @service store;

  beforeModel(transition) {
    // TODO quand on aura la page de détails d'une épreuve traduite, transition vers le détail
    const locale = transition.to.queryParams.locale;
    if (locale) {
      const overview = transition.to.params.overview;
      const skillId = transition.to.params.skill_id;
      this.router.transitionTo('authenticated.v2.competence-overview.localized-challenges', overview, skillId);
    }
  }

  async model(params) {
    const { competence_id: competenceId } = this.paramsFor('authenticated.v2');
    const { challenge_id, overview, skill_id } = params;
    const skill = await this.store.findRecord('skill', skill_id, { backgroundReload: false });
    const challenges = await skill.hasMany('challengesProduction').load();
    const challenge = await this.store.findRecord('challenge', challenge_id);
    await challenge.attachments;
    return { challenge, challenges, competenceId, overview, skill };
  }
}
