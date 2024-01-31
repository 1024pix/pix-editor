import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MissionDetailsRoute extends Route {
  @service access;
  @service currentData;

  async model() {
    const mission = this.modelFor('authenticated.missions.mission');
    const competences = await this.currentData.getCompetencesFromPix1DFramework();
    const missionCompetence = competences.filter((competence) => competence.pixId === mission.competenceId);
    let missionThematicName;
    if (mission.thematicId) {
      const thematics = await this.currentData.getThematicsFromPix1DFramework();
      const missionThematic = thematics.filter((thematic) => thematic.id === mission.thematicId);
      missionThematicName = missionThematic[0].name;
    }
    const userMayCreateOrEditMissions = this.access.mayCreateOrEditMission();

    return {
      mission,
      competence: missionCompetence[0].title,
      thematic: missionThematicName,
      userMayCreateOrEditMissions,
    };
  }
}
