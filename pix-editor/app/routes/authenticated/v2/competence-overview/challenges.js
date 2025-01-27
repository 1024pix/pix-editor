import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengesRoute extends Route {
  @service store;
  @service router;
  @service versionManager;

  beforeModel(transition) {
    const locale = transition.to.queryParams.locale;
    if (locale) {
      this.router.transitionTo('authenticated.v2.competence-overview.localized-challenges', transition.to.params.skill_id);
    }
  }

  async model(params) {
    const { competence_id: competenceId } = this.paramsFor('authenticated.v2');
    const { overview } = this.paramsFor('authenticated.v2.competence-overview');
    const { skill_id } = params;

    const skill = await this.store.findRecord('skill', skill_id);
    const challenges = await skill.challengesProduction;

    return { challenges, overview, skill, competenceId };
  }

  afterModel(model) {
    if (this.versionManager.isV2) return;

    const { challenges } = model;

    const { competenceOverview } = this.modelFor('authenticated.v2.competence-overview');
    const competence_id = competenceOverview.airtableId;
    const locale = competenceOverview.locale;
    const view = competenceOverview.view;

    const prototype = challenges.find((challenge) => challenge.isPrototype);

    this.router.transitionTo('authenticated.competence.prototypes.single', competence_id, prototype.id, { queryParams: { languageFilter: locale, view } });
  }
}
