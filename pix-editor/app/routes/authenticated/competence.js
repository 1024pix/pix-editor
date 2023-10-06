import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CompetenceRoute extends Route {
  @service currentData;
  @service paginatedQuery;
  @service store;

  model(params) {
    return this.store.findRecord('competence', params.competence_id);
  }

  async afterModel(model) {
    this.currentData.setCompetence(model);
    const area = await model.area;
    const framework = await area.framework;
    this.currentData.setFramework(framework);
    if (model.needsRefresh) {
      const themes = await model.hasMany('rawThemes').reload();
      const themesTubes = await Promise.all(themes.map(theme => theme.hasMany('rawTubes').reload()));
      const tubesSkills = await Promise.all(themesTubes.flatMap(tubes => tubes.map(tube => tube.hasMany('rawSkills').reload())));
      await Promise.all(tubesSkills.flatMap(skills => skills.map(skill => skill.hasMany('challenges').reload())));
      model.needsRefresh = false;
    } else {
      const themes = await model.rawThemes;
      const themesTubes = await Promise.all(themes.map(theme => theme.rawTubes));
      const skillsStubes = await Promise.all(themesTubes.flatMap(tubes => tubes.map(tube => tube.rawSkills)));
      await Promise.all(skillsStubes.flatMap(skills => skills.map(skill => skill.challenges)));
    }
  }

  @action
  refreshModel() {
    const model = this.modelFor(this.routeName);
    model.needsRefresh = true;
    this.refresh();
  }
}
