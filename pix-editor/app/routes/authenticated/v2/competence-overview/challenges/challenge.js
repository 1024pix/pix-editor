import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ChallengeRoute extends Route {
  @service router;
  @service store;

  beforeModel(transition) {
    // TODO quand on aura la page de détails d'une épreuve traduite, transition vers le détail
    const locale = transition.to.queryParams.locale;
    if (locale) {
      const { overview } = this.paramsFor('authenticated.v2.competence-overview');
      const { skill_id: skillId } = this.paramsFor('authenticated.v2.competence-overview.challenges');

      this.router.transitionTo('authenticated.v2.competence-overview.localized-challenges', overview, skillId);
    }
  }

  async model(params) {
    const { challenges, overview, skill, competenceId } = this.modelFor(
      'authenticated.v2.competence-overview.challenges',
    );

    const { challenge_id } = params;

    const challenge = await this.store.findRecord('challenge', challenge_id);
    await challenge.attachments;

    return { challenge, challenges, competenceId, overview, skill };
  }
}
