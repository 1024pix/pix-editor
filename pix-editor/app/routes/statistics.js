import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StatisticsRoute extends Route {

  @service currentData;

  model() {
    return this.currentData.getFramework().areas;
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
      });
  }

}
