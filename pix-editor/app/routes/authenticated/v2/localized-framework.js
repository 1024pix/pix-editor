import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CompetenceOverviewRoute extends Route {
  @service router;
  @service store;

  async beforeModel() {
    const { competence, locale } = this.modelFor('authenticated.v2');

    if (!locale) this.router.transitionTo('authenticated.v2.competence-overview', competence.id, 'challenges-production');
  }

  async model() {
    const { competence, locale } = this.modelFor('authenticated.v2');
    const themes = await competence.rawThemes;
    await Promise.all(themes.map((theme) => theme.rawTubes));
    const localizedFrameworkTubes = await this.store.query('localized-framework-tube', { filter: { competenceId: competence.id, locale } });
    return { localizedFrameworkTubes, competence, locale };
  }
}
