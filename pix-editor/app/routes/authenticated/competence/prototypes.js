import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PrototypesRoute extends Route {

  @service currentData;
  @service store;
  @service router;

  refreshing = false;

  beforeModel(transition) {
    if (transition.to.queryParams.view === 'draft') {
      this.router.replaceWith({
        queryParams: {
          view: 'production',
        },
      });
    }
  }

  async model() {
    const competence = this.modelFor('authenticated.competence');

    const params = this.paramsFor('authenticated.competence');
    const { view = 'production', languageFilter: locale } = params;

    if (view === 'workbench-list') {
      if (this.refreshing) {
        const themes = await competence.hasMany('rawThemes').reload();
        const themesTubes = await Promise.all(themes.map((theme) => theme.hasMany('rawTubes').reload()));
        const tubesSkills = await Promise.all(themesTubes.flatMap((tubes) => tubes.map((tube) => tube.hasMany('rawSkills').reload())));
        Promise.all(tubesSkills.flatMap((skills) => skills.map((skill) => skill.hasMany('challenges').reload()))).catch(console.error);
        this.refreshing = false;
      } else {
        const themes = await competence.rawThemes;
        const themesTubes = await Promise.all(themes.map((theme) => theme.rawTubes));
        const tubesSkills = await Promise.all(themesTubes.flatMap((tubes) => tubes.map((tube) => tube.rawSkills)));
        Promise.all(tubesSkills.flatMap((skills) => skills.map((skill) => skill.hasMany('challenges').load()))).catch(console.error);
      }
      return null;
    }

    let id = `${competence.pixId}:challenges-${view}`;
    if (view === 'production' && locale) id += `:${locale}`;
    this.refreshing = false;
    return this.store.findRecord('competence-overview', id);

  }

  afterModel() {
    // QUESTION: est-ce nécessaire ?
    this.currentData.setPrototype(null);
  }

  @action
  refreshModel() {
    this.refreshing = true;
    this.refresh();
  }
}
