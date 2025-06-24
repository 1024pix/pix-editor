import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MissionDetailsRoute extends Route {
  @service access;
  @service currentData;

  async model() {
    const mission = this.modelFor('authenticated.missions.mission');
    const competences = await this.currentData.getCompetencesFromPixJuniorFramework();
    const missionCompetence = competences.filter((competence) => competence.pixId === mission.competenceId);
    let missionThematicNames;
    if (mission.thematicIds) {
      const pixJuniorThematics = await this.currentData.getThematicsFromPixJuniorFramework();
      const thematicNameById = new Map(pixJuniorThematics.map((thematic) => [thematic.pixId, thematic.name]));
      const missionThematicIds = mission.thematicIds.split(',');
      missionThematicNames = missionThematicIds.map((thematicId) => thematicNameById.get(thematicId)).join(', ');
    }
    const userMayCreateOrEditMissions = this.access.mayCreateOrEditMission();

    return {
      mission,
      competence: missionCompetence[0].title,
      thematics: missionThematicNames,
      userMayCreateOrEditMissions,
    };
  }
}
