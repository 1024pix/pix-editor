import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import FrameworkModel from '../../../models/framework';

export default class MissionNewRoute extends Route {
  @service access;
  @service router;
  @service store;
  @service currentData;


  beforeModel() {
    if (!this.access.mayCreateOrEditStaticCourse()) {
      this.router.transitionTo('authenticated.missions.list');
    }
  }

  async model(params) {
    const frameworks = this.currentData.getFrameworks().filter((framework) => framework.name === FrameworkModel.pix1DFrameworkName);
    const getAreas = frameworks.map(framework => framework.areas);

    const frameworkAreas = await Promise.all(getAreas);
    const getCompetences = frameworkAreas.map(areas => areas.map(area => area.competences)).flat();
    const areaCompetences = await Promise.all(getCompetences);
    const mission = await this.store.findRecord('mission', params.mission_id);
    return {
      mission,
      competences: areaCompetences.flatMap((competences) => competences.toArray()),
    };
  }

  afterModel(model) {
    const getThemes = model.competences.map(competence => competence.rawThemes);
    return Promise.all(getThemes);
  }
}
