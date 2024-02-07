import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MissionNewRoute extends Route {
  @service access;
  @service router;
  @service store;
  @service currentData;


  beforeModel() {
    if (!this.access.mayCreateOrEditMission()) {
      this.router.transitionTo('authenticated.missions.list');
    }
  }

  async model() {
    const competences = await this.currentData.getCompetencesFromPix1DFramework();
    const mission = this.modelFor('authenticated.missions.mission');
    return {
      mission,
      competences
    };
  }

  afterModel() {
    return this.currentData.getThematicsFromPix1DFramework();
  }
}
