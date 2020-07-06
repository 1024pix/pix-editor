import Component from '@glimmer/component';

export default class StatisticsProductionComponent extends Component {

  _productionChallengeCounts = null;
  _productionSkillCounts = null;
  _productionTubeCounts = null;
  _productionData = null;
  _productionTubeTotal = null;
  _productionSkillTotal = null;
  _productionChallengeTotal = null;

  get productionTubeCounts() {
    if (!this._productionTubeCounts) {
      this._productionTubeCounts = this.args.areas.reduce((current, area) => {
        return area.competences.reduce((current, competence) => {
          current[competence.code] = competence.productionTubeCount;
          return current;
        }, current);
      }, {});
    }
    return this._productionTubeCounts;
  }

  get productionSkillCounts() {
    if (!this._productionSkillCounts) {
      this._productionSkillCounts = this.args.areas.reduce((current, area) => {
        return area.competences.reduce((current, competence) => {
          current[competence.code] = competence.tubes.reduce((current, tube) => {
            return current + tube.productionSkillCount;
          }, 0);
          return current;
        }, current);
      }, {});
    }
    return this._productionSkillCounts;
  }

  get productionChallengeCounts() {
    if (!this._productionChallengeCounts) {
      this._productionChallengeCounts = this.args.areas.reduce((current, area) => {
        return area.competences.reduce((current, competence) => {
          current[competence.code] = competence.tubes.reduce((current, tube) => {
            return current + tube.skills.reduce((current, skill) => {
              return current + skill.challenges.filter(challenge => challenge.isValidated).length;
            },0);
          },0);
          return current;
        }, current);
      }, {});
    }
    return this._productionChallengeCounts;
  }

  get productionData() {
    if (!this._productionData) {
      this._productionData = this.args.competenceCodes.map(code => ({
        name:code,
        tubes:this.productionTubeCounts[code],
        skills:this.productionSkillCounts[code],
        challenges:this.productionChallengeCounts[code],
        rate:(this.productionChallengeCounts[code] * 100 / this.productionChallengeTotal).toFixed(1)
      }));
    }
    return this._productionData;
  }

  get productionTubeTotal() {
    if (!this._productionTubeTotal) {
      this._productionTubeTotal = Object.values(this.productionTubeCounts).reduce((current, value) => current + value, 0);
    }
    return this._productionTubeTotal;
  }

  get productionSkillTotal() {
    if (!this._productionSkillTotal) {
      this._productionSkillTotal = Object.values(this.productionSkillCounts).reduce((current, value) => current + value, 0);
    }
    return this._productionSkillTotal;
  }

  get productionChallengeTotal() {
    if (!this._productionChallengeTotal) {
      this._productionChallengeTotal = Object.values(this.productionChallengeCounts).reduce((current, value) => current + value, 0);
    }
    return this._productionChallengeTotal;
  }

}
