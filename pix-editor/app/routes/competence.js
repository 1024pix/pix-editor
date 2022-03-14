import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CompetenceRoute extends Route {
  @service paginatedQuery;
  @service currentData;
  @service auth;
  @service router;

  beforeModel(transition) {
    if (!this.auth.connected) {
      this.router.transitionTo('index');
    }
  }

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
      const getTubes = themes.map(theme => theme.hasMany('rawTubes').reload());
      const tubes = await Promise.all(getTubes);
      const getSkills = tubes.map(tube => tube.hasMany('rawSkills').reload()).flat();
      const skills = await Promise.all(getSkills);
      const getChallenges = skills.map(skill => skill.hasMany('challenges').reload()).flat();
      await Promise.all(getChallenges);
      model.needsRefresh = false;
    } else {
      const themes = await model.rawThemes;
      const getTubes = themes.map(theme => theme.rawTubes);
      const tubesSet = await Promise.all(getTubes);
      const getSkills = tubesSet.map(tubes => tubes.map(tube => tube.rawSkills)).flat();
      const skillsSet = await Promise.all(getSkills);
      const getChallenges = skillsSet.map(skills => skills.map(skill => skill.challenges)).flat();
      await Promise.all(getChallenges);
    }
  }

  @action
  refreshModel() {
    const model = this.modelFor(this.routeName);
    model.needsRefresh = true;
    this.refresh();
  }
}
