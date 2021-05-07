import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentDataService extends Service {
  @tracked _areas = null;
  @tracked _competence = null;
  @tracked _prototype = null;
  @tracked _frameworks = null;
  @tracked _framework = null;
  @tracked _sources = null;
  @tracked _source = null;

  setFrameworks(frameworks) {
    this._frameworks = frameworks;
  }

  setFramework(framework) {
    this._framework = framework;
  }

  setAreas(areas) {
    this._areas = areas;
  }

  setCompetence(competence) {
    this._competence = competence;
  }

  setPrototype(prototype) {
    this._prototype = prototype;
  }

  getFrameworks() {
    return this._frameworks;
  }

  getFramework() {
    return this._framework;
  }

  setSources(sources) {
    this._sources = sources;
  }

  setSource(source) {
    this._source = source;
  }

  get isPixFramework() {
    return this._framework.name === 'Pix';
  }

  getAreas(filteredBySource = true) {
    if (filteredBySource && this._framework) {
      return this._framework.areas;
    }
    if (filteredBySource && this._areas) {
      return this._areas.filter(area => area.source === this._source);
    }
    return this._areas;
  }

  getSources() {
    return this._sources;
  }

  getSource() {
    return this._source;
  }

  get isPixSource() {
    return this.getSource() === 'Pix';
  }

  getCompetence() {
    return this._competence;
  }

  getPrototype() {
    return this._prototype;
  }

}
