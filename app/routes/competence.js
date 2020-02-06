import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

@classic
export default class CompetenceRoute extends Route {
  @service
  paginatedQuery;

  model(params) {
    return this.get('store').findRecord("competence", params.competence_id);
  }

  afterModel(model) {
    if (model.get('needsRefresh')) {
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
        const store = this.get('store');
        const reloadChallenges = uniqueChallenges.map(challengeId => store.findRecord('challenge', challengeId, { reload: true }));
        return Promise.all(reloadChallenges);
      })
      .then(() => {
        model.set('needsRefresh', false);
      });
    } else {
      return model.get('rawTubes')
      .then(tubes => {
        const getSkills = tubes.map(tube => tube.get('rawSkills'));
        return Promise.all(getSkills);
      })
      .then(skillsSet => {
        const getChallenges = skillsSet.map( skills => skills.map(skill => skill.get('challenges'))).flat();
        return Promise.all(getChallenges);
      })
    }
  }

  @action
  refreshModel() {
    let model = this.modelFor(this.routeName);
    model.set('needsRefresh', true);
    this.refresh();
  }
}
