import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentDataService extends Service {
  @tracked _areas = null;
  @tracked _competence = null;
  @tracked _template = null;

  setAreas(areas) {
    this._areas = areas;
  }

  setCompetence(competence) {
    this._competence = competence;
  }

  setTemplate(template) {
    this._template = template;
  }

  getAreas() {
    return this._areas;
  }

  getCompetence() {
    return this._competence;
  }

  getTemplate() {
    return this._template;
  }


}
