import Component from '@glimmer/component';

export default class StatisticsProductionComponent extends Component {

  get productionTubeCounts() {
    return this.productionCounts((competence) => {
      return competence.productionTubeCount;
    });
  }

  get productionSkillCounts() {
    return this.productionCounts((competence) => {
      return competence.tubes.reduce((current, tube) => {
        return current + tube.productionSkillCount;
      }, 0);
    });
  }

  get productionChallengeCounts() {
    return this.productionCounts((competence) => {
      return competence.tubes.reduce((current, tube) => {
        return current + tube.liveSkills.reduce((current, skill) => {
          return current + skill.challenges.filter(challenge => challenge.isValidated).length;
        },0);
      },0);
    });
  }

  productionCounts(callbackCount) {
    return this.args.areas.reduce((current, area) => {
      return area.competences.reduce((current, competence) => {
        current[competence.code] = callbackCount(competence);
        return current;
      }, current);
    }, {});
  }

  get productionData() {
    return this.args.competenceCodes.map(code => ({
      name:code,
      tubes:this.productionTubeCounts[code],
      skills:this.productionSkillCounts[code],
      challenges:this.productionChallengeCounts[code],
      rate:(this.productionChallengeCounts[code] * 100 / this.productionChallengeTotal).toFixed(1)
    }));
  }

  get productionTubeTotal() {
    return this.productionTotal(this.productionTubeCounts);
  }

  get productionSkillTotal() {
    return this.productionTotal(this.productionSkillCounts);
  }

  get productionChallengeTotal() {
    return this.productionTotal(this.productionChallengeCounts);
  }

  productionTotal(productionCounts) {
    return Object.values(productionCounts).reduce((current, value) => current + value, 0);
  }

}
