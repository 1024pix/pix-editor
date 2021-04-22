import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentDataService extends Service {
  @tracked _areas = null;
  @tracked _competence = null;
  @tracked _prototype = null;
  @tracked _sources = null;
  @tracked _source = null;

  setAreas(areas) {
    this._areas = areas;
  }

  setCompetence(competence) {
    this._competence = competence;
  }

  setPrototype(prototype) {
    this._prototype = prototype;
  }

  setSources(sources) {
    this._sources = sources;
  }

  setSource(source) {
    this._source = source;
  }

  getAreas(filteredBySource = true) {
    if (filteredBySource && this._areas)
      return this._areas.filter(area => area.source === this._source);
    else
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
