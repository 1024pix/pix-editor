import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class TargetProfileRoute extends Route {
  @service paginatedQuery;

  model() {
    return this.modelFor('application');
  }

  afterModel(model) {
    const getCompetences = model.map(area => area.competences);
    return Promise.all(getCompetences)
    .then(areaCompetences => {
      const getTubes = areaCompetences.map(competences => competences.map(competence => competence.rawTubes)).flat();
      return Promise.all(getTubes);
    })
    .then(competenceTubes => {
      const getSkills = competenceTubes.map(tubes => tubes.map(tube => tube.rawSkills)).flat();
      return Promise.all(getSkills);
    })
    .then(tubeSkills => {
      const getChallenges = tubeSkills.map(skills => skills.map(skill => skill.challenges)).flat();
      return Promise.all(getChallenges);
    })
  }
}
