import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import FrameworkModel from '../models/framework';

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

  get isPixFramework() {
    return this._framework && this._framework.name === 'Pix';
  }

  getAreas(filteredBySource = true) {
    if (filteredBySource && this._framework) {
      return this._framework.sortedAreas;
    }
    return this._areas;
  }

  getCompetence() {
    return this._competence;
  }

  getPrototype() {
    return this._prototype;
  }

  async getCompetencesFromPix1DFramework() {
    const frameworks = this.getFrameworks().filter((framework) => framework.name === FrameworkModel.pix1DFrameworkName);
    const getAreas = frameworks.map(framework => framework.areas);
    const frameworkAreas = await Promise.all(getAreas);
    const getCompetences = frameworkAreas.map(areas => areas.map(area => area.competences)).flat();
    const areaCompetences = await Promise.all(getCompetences);
    return areaCompetences.flatMap((competences) => competences.toArray());
  }

  async getThematicsFromPix1DFramework() {
    const competences = await this.getCompetencesFromPix1DFramework();
    const getThemes = competences.map(competence => competence.rawThemes);
    const themes = await Promise.all(getThemes);
    return themes.flatMap((theme) => theme.toArray());
  }
}
