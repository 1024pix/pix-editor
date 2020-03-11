import Controller from '@ember/controller';

export default class StatisticsController extends Controller {

  _productionChallengeCounts = null;
  _productionSkillCounts = null;
  _competenceCodes = null;
  _productionTubeCounts = null;
  _productionData = null;
  _productionTubeTotal = null;
  _i18nData = null;
  _productionSkillTotal = null;
  _productionChallengeTotal = null;
  _i18nCountryCounts = null;
  _i18nNeutralTotal = null;
  _i18nAfricaTotal = null;
  _i18nUnescoTotal = null;
  _i18nWorldSkills = null;
  _i18nEuropeanSkills = null;
  _i18nFrenchSkills = null;

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
    if (!this._productionTubeCounts) {
      this._productionTubeCounts = this.model.reduce((current, area) => {
        return area.competences.reduce((current, competence) => {
          current[competence.code] = competence.productionTubeCount;
          return current;
        }, current)
      }, {});
    }
    return this._productionTubeCounts;
  }

  get productionSkillCounts() {
    if (!this._productionSkillCounts) {
      this._productionSkillCounts = this.model.reduce((current, area) => {
        return area.competences.reduce((current, competence) => {
          current[competence.code] = competence.tubes.reduce((current, tube) => {
              return current+tube.productionSkillCount;
            }, 0);
          return current;
        }, current);
      }, {});
    }
    return this._productionSkillCounts;
  }

  get productionChallengeCounts() {
    if (!this._productionChallengeCounts){
      this._productionChallengeCounts = this.model.reduce((current, area) => {
        return area.competences.reduce((current, competence) => {
          current[competence.code] = competence.tubes.reduce((current, tube) => {
            return current+tube.skills.reduce((current, skill) => {
              return current + skill.challenges.filter(challenge => challenge.isValidated).length;
            },0);
          },0);
          return current;
        }, current);
      }, {});
    }
    return this._productionChallengeCounts;
  }

  get competenceCodes() {
    if (!this._competenceCodes){
      this._competenceCodes = this.model.reduce((current, area) => {
        current.push(area.sortedCompetences.map(competence => competence.code));
        return current;
      }, []).flat();
    }
    return this._competenceCodes;
  }

  get productionData() {
    if (!this._productionData) {
      this._productionData = this.competenceCodes.map(code => ({
        name:code,
        tubes:this.productionTubeCounts[code],
        skills:this.productionSkillCounts[code],
        challenges:this.productionChallengeCounts[code],
        rate:(this.productionChallengeCounts[code]*100/this.productionChallengeTotal).toFixed(1)
      }));
    }
    return this._productionData;
  }

  get productionTubeTotal() {
    if (!this._productionTubeTotal) {
      this._productionTubeTotal = Object.values(this.productionTubeCounts).reduce((current, value) => current+value, 0);
    }
    return this._productionTubeTotal;
  }

  get productionSkillTotal() {
    if (!this._productionSkillTotal) {
      this._productionSkillTotal = Object.values(this.productionSkillCounts).reduce((current, value) => current+value, 0);
    }
    return this._productionSkillTotal;
  }

  get productionChallengeTotal() {
    if (!this._productionChallengeTotal) {
      this._productionChallengeTotal = Object.values(this.productionChallengeCounts).reduce((current, value) => current+value, 0);
    }
    return this._productionChallengeTotal;
  }

  get i18nCountryCounts() {
    if (!this._i18nCountryCounts) {
      this._i18nCountryCounts = this.model.reduce((current, area) => {
        return area.competences.reduce((current, competence) => {
          current[competence.code] = competence.tubes.reduce((current, tube) => {
            return tube.productionSkills.reduce((current, skill) => {
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
          }, [[0,0],[0,0],[0,0]]);
          return current;
        }, current);
      }, {});
    }
    return this._i18nCountryCounts;
  }

  get i18nData() {
    if (!this._i18nData) {
      this._i18nData = this.competenceCodes.map(code => ({
        name:code,
        neutralValidated:this.i18nCountryCounts[code][0][0],
        neutralSuggested:this.i18nCountryCounts[code][0][1],
        africaValidated:this.i18nCountryCounts[code][1][0],
        africaSuggested:this.i18nCountryCounts[code][1][1],
        unescoValidated:this.i18nCountryCounts[code][2][0],
        unescoSuggested:this.i18nCountryCounts[code][2][1]
      }));
    }
    return this._i18nData;
  }

  get i18nNeutralTotal() {
    if (!this._i18nNeutralTotal) {
      this._i18nNeutralTotal = Object.values(this.i18nData).reduce((current, value) => {
        current.validated+=value.neutralValidated;
        current.suggested+=value.neutralSuggested;
        return current;
      }, {validated:0, suggested:0});
    }
    return this._i18nNeutralTotal;
  }

  get i18nAfricaTotal() {
    if (!this._i18nAfricaTotal) {
      this._i18nAfricaTotal = Object.values(this.i18nData).reduce((current, value) => {
        current.validated+=value.africaValidated;
        current.suggested+=value.africaSuggested;
        return current;
      }, {validated:0, suggested:0});
    }
    return this._i18nAfricaTotal;
  }

  get i18nUnescoTotal() {
    if (!this._i18nUnescoTotal) {
      this._i18nUnescoTotal = Object.values(this.i18nData).reduce((current, value) => {
        current.validated+=value.unescoValidated;
        current.suggested+=value.unescoSuggested;
        return current;
      }, {validated:0, suggested:0});
    }
    return this._i18nUnescoTotal;
  }

  get i18nWorldSkills() {
    if (!this._i18nWorldSkills) {
      this._i18nWorldSkills = this.model.reduce((current, area) => {
        return area.competences.reduce((current, competence) => {
          return competence.tubes.reduce((current, tube) => {
            return tube.productionSkills.reduce((current, skill) => {
              if (skill.i18n === 'Monde') {
                current++;
              }
              return current;
            }, current);
          }, current);
        }, current);
      }, 0);
    }
    return this._i18nWorldSkills;
  }

  get i18nEuropeanSkills() {
    if (!this._i18nEuropeanSkills) {
      this._i18nEuropeanSkills = this.model.reduce((current, area) => {
        return area.competences.reduce((current, competence) => {
          return competence.tubes.reduce((current, tube) => {
            return tube.productionSkills.reduce((current, skill) => {
              if (skill.i18n === 'Union Européenne') {
                current++;
              }
              return current;
            }, current);
          }, current);
        }, current);
      }, 0);
    }
    return this._i18nEuropeanSkills;
  }

  get i18nFrenchSkills() {
    if (!this._i18nFrenchSkills) {
      this._i18nFrenchSkills = this.model.reduce((current, area) => {
        return area.competences.reduce((current, competence) => {
          return competence.tubes.reduce((current, tube) => {
            return tube.productionSkills.reduce((current, skill) => {
              if (skill.i18n === 'France') {
                current++;
              }
              return current;
            }, current);
          }, current);
        }, current);
      }, 0);
    }
    return this._i18nFrenchSkills;
  }


}
