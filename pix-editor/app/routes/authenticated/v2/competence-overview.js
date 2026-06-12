import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CompetenceOverviewRoute extends Route {
  @service router;
  @service store;
  @service versionManager;

  async model(params) {
    const overview = params.overview;
    const { competence, locale } = this.modelFor('authenticated.v2');
    let localizedFrameworkTubes;
    const themes = await competence.rawThemes;

    await Promise.all(themes.map((theme) => theme.rawTubes));
    if (locale) {
      localizedFrameworkTubes = await this.store.query('localized-framework-tube', {
        filter: { competenceId: competence.id, locale },
      });
    }
    let id = `${competence.pixId}:${overview}`;
    if (locale) id += `:${locale}`;
    const competenceOverview = await this.store.findRecord('competence-overview', id);

    return {
      competenceOverview,
      locale,
      localizedFrameworkTubes,
    };
  }
}
