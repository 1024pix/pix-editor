import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

@classic
export default class TargetProfileRoute extends Route {
  @service
  paginatedQuery;

  model() {
    return this.modelFor('application');
  }

  afterModel(model) {
    const getCompetences = model.map(area => area.get('competences'));
    return Promise.all(getCompetences)
    .then(areaCompetences => {
      const getTubes = areaCompetences.map(competences => competences.map(competence => competence.get('rawTubes'))).flat();
      return Promise.all(getTubes);
    })
    .then(competenceTubes => {
      const getSkills = competenceTubes.map(tubes => tubes.map(tube => tube.get('rawSkills'))).flat();
      return Promise.all(getSkills);
    })
    .then(tubeSkills => {
      const getChallenges = tubeSkills.map(skills => skills.map(skill => skill.get('challenges'))).flat();
      return Promise.all(getChallenges);
    })
  }
}
