import Route from '@ember/routing/route';

export default class TargetProfileRoute extends Route {

  model() {
    return this.modelFor('application');
  }

  afterModel(model) {
    const getAreas = model.map(framework => framework.areas);
    return Promise.all(getAreas)
      .then(frameworkAreas => {
        const  getCompetences = frameworkAreas.map(areas => areas.map(area => area.competences)).flat();
        return Promise.all(getCompetences);
      })
      .then(areaCompetences => {
        const getTheme = areaCompetences.map(competences => competences.map(competence => competence.rawThemes)).flat();
        return Promise.all(getTheme);
      })
      .then(competenceTheme => {
        const getTubes = competenceTheme.map(themes => themes.map(theme => theme.rawTubes)).flat();
        return Promise.all(getTubes);
      })
      .then(themeTubes => {
        const getSkills = themeTubes.map(tubes => tubes.map(tube => tube.rawSkills)).flat();
        return Promise.all(getSkills);
      })
      .then(tubeSkills => {
        const getChallenges = tubeSkills.map(skills => skills.map(skill => skill.challenges)).flat();
        return Promise.all(getChallenges);
      });
  }
}
