import Service from '@ember/service';

export default class CurrentDataService extends Service {
  _areas = null;
  _competence = null;
  _template = null;

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
