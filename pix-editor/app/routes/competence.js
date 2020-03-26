import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class CompetenceRoute extends Route {
  @service paginatedQuery;
  @service currentData;

  model(params) {
    return this.store.findRecord('competence', params.competence_id);
  }

  afterModel(model) {
    this.currentData.setCompetence(model);
    this.currentData.setSource(model.source);
    if (model.needsRefresh) {
      return model.hasMany('rawTubes').reload()
      .then(tubes => {
        const getSkills = tubes.map(tube => tube.hasMany('rawSkills').reload());
        return Promise.all(getSkills);
      })
      .then(skillsSet => {
        // cannot use skills.hasMany('challenges').reload() since
        // it bugs when a challenge is linked to several skills
        const challenges = skillsSet.map( skills => skills.reduce((list, skill) => {
          return list.concat(skill.hasMany('challenges').ids());
        }, [])).flat();
        const uniqueChallenges = [...new Set(challenges)];
        const store = this.store;
        const reloadChallenges = uniqueChallenges.map(challengeId => store.findRecord('challenge', challengeId, { reload: true }));
        return Promise.all(reloadChallenges);
      })
      .then(() => {
        model.needsRefresh = false;
      });
    } else {
      return model.rawTubes
      .then(tubes => {
        const getSkills = tubes.map(tube => tube.rawSkills);
        return Promise.all(getSkills);
      })
      .then(skillsSet => {
        const getChallenges = skillsSet.map( skills => skills.map(skill => skill.challenges)).flat();
        return Promise.all(getChallenges);
      })
    }
  }

  @action
  refreshModel() {
    let model = this.modelFor(this.routeName);
    model.needsRefresh = true;
    this.refresh();
  }
}
