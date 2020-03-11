import Controller from '@ember/controller';

export default class StatisticsController extends Controller {

  _i18nAreas = new Map([
    ['Neutre',0],
    ['Bénin', 1],
    ['Burkina Faso', 1],
    ['Burundi',1],
    ['Cameroun',1],
    ['Les Comores',1],
    ['Côte d\'Ivoire',1],
    ['Djibouti',1],
    ['Gabon',1],
    ['Guinée',1],
    ['Madagascar',1],
    ['Mali',1],
    ['Niger',1],
    ['République centrafricaine',1],
    ['Congo',1],
    ['Rwanda',1],
    ['Sénégal',1],
    ['Seychelles',1],
    ['Tchad',1],
    ['Togo',1],
    ['Algérie',2],
    ['Israël',2],
    ['Jordanie',2],
    ['Liban',2],
    ['Libye',2],
    ['Maroc',2],
    ['Palestine',2],
    ['Tunisie',2]
  ]);


  get productionTubeCounts() {
    return this.model.reduce((current, area) => {
      return area.competences.reduce((current, competence) => {
        current[competence.code] = competence.productionTubeCount;
        return current;
      }, current)
    }, {});
  }

  get productionSkillCounts() {
    return this.model.reduce((current, area) => {
      return area.competences.reduce((current, competence) => {
        current[competence.code] = competence.tubes.reduce((current, tube) => {
            return current+tube.productionSkillCount;
          }, 0);
        return current;
      }, current);
    }, {})
  }

  get productionChallengeCounts() {
    return this.model.reduce((current, area) => {
      return area.competences.reduce((current, competence) => {
        current[competence.code] = competence.tubes.reduce((current, tube) => {
          return current+tube.skills.reduce((current, skill) => {
            return current + skill.challenges.filter(challenge => challenge.isValidated).length;
          },0);
        },0);
        return current;
      }, current);
    }, {})
  }

  get competenceCodes() {
    return this.model.reduce((current, area) => {
      current.push(area.sortedCompetences.map(competence => competence.code));
      return current;
    }, []).flat();
  }

  get productionData() {
    return this.competenceCodes.map(code => ({
      name:code,
      tubes:this.productionTubeCounts[code],
      skills:this.productionSkillCounts[code],
      challenges:this.productionChallengeCounts[code],
      rate:(this.productionChallengeCounts[code]*100/this.productionChallengeTotal).toFixed(1)
    }))
  }

  get productionTubeTotal() {
    return Object.values(this.productionTubeCounts).reduce((current, value) => current+value, 0);
  }

  get productionSkillTotal() {
    return Object.values(this.productionSkillCounts).reduce((current, value) => current+value, 0);
  }

  get productionChallengeTotal() {
    return Object.values(this.productionChallengeCounts).reduce((current, value) => current+value, 0);
  }

  get i18nCountryCounts() {
    return this.model.reduce((current, area) => {
      return area.competences.reduce((current, competence) => {
        current[competence.code] = competence.tubes.reduce((current, tube) => {
          return tube.skills.reduce((current, skill) => {
            if (skill.i18n === 'Monde') {
              return skill.challenges.reduce((current, challenge) => {
                if (this._i18nAreas.has(challenge.area)) {
                  const index = this._i18nAreas.get(challenge.area);
                  if (challenge.isValidated) {
                    current[index][0]++;
                  } else if (challenge.isSuggested) {
                    current[index][1]++;
                  }
                }
                return current;
              }, current);
            }
            return current;
          }, current);
        }, [[0,0],[0,0],[0,0]])
        return current;
      }, current);
    }, {});
  }

  get i18nData() {
    return this.competenceCodes.map(code => ({
      name:code,
      neutralValidated:this.i18nCountryCounts[code][0][0],
      neutralSuggested:this.i18nCountryCounts[code][0][1],
      africaValidated:this.i18nCountryCounts[code][1][0],
      africaSuggested:this.i18nCountryCounts[code][1][1],
      unescoValidated:this.i18nCountryCounts[code][2][0],
      unescoSuggested:this.i18nCountryCounts[code][2][1]
    }))
  }

  get i18nNeutralTotal() {
    return Object.values(this.i18nData).reduce((current, value) => current+value.neutralValidated, 0);
  }

  get i18nAfricaTotal() {
    return Object.values(this.i18nData).reduce((current, value) => current+value.africaValidated, 0);
  }

  get i18nUnescoTotal() {
    return Object.values(this.i18nData).reduce((current, value) => current+value.unescoValidated, 0);
  }

}
