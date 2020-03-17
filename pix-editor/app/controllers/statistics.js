import Controller from '@ember/controller';

export default class StatisticsController extends Controller {


  get competenceCodes() {
    if (!this._competenceCodes){
      this._competenceCodes = this.model.reduce((current, area) => {
        current.push(area.sortedCompetences.map(competence => competence.code));
        return current;
      }, []).flat();
    }
    return this._competenceCodes;
  }

}
