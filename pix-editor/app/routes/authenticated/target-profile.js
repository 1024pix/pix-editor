import Route from '@ember/routing/route';

export default class TargetProfileRoute extends Route {

  model() {
    return this.modelFor('authenticated');
  }

  async afterModel(model) {
    const getAreas = model.map(framework => framework.areas);
    const frameworkAreas = await Promise.all(getAreas);
    const getCompetences = frameworkAreas.map(areas => areas.map(area => area.competences)).flat();
    const areaCompetences = await Promise.all(getCompetences);
    const getTheme = areaCompetences.map(competences => competences.map(competence => competence.rawThemes)).flat();
    const competenceTheme = await Promise.all(getTheme);
    const getTubes = competenceTheme.map(themes => themes.map(theme => theme.rawTubes)).flat();
    const themeTubes = await Promise.all(getTubes);
    const getSkills = themeTubes.map(tubes => tubes.map(tube => tube.rawSkills)).flat();
    return Promise.all(getSkills);
  }
}
