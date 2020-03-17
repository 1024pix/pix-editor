import Component from '@glimmer/component';

export default class StatisticsI18nComponent extends Component {

  _i18nData = null;
  _i18nCountryCounts = null;
  _i18nNeutralTotal = null;
  _i18nAfricaTotal = null;
  _i18nOccidentTotal = null;
  _i18nUnescoTotal = null;
  _i18nWorldSkills = null;
  _i18nEuropeanSkills = null;
  _i18nFrenchSkills = null;

  _i18nAreas = new Map([
    ['Neutre',0],
    ['Allemagne',1],
    ['Argentine', 1],
    ['Belgique', 1],
    ['Brésil',1],
    ['Canada', 1],
    ['Chine', 1],
    ['Espagne', 1],
    ['France', 1],
    ['Grèce', 1],
    ['Italie', 1],
    ['Japon', 1],
    ['Mexique', 1],
    ['Portugal', 1],
    ['Suisse', 1],
    ['UK', 1],
    ['USA', 1],
    ['Vénézuela', 1],
    ['Bénin', 2],
    ['Burkina Faso', 2],
    ['Burundi',2],
    ['Cameroun',2],
    ['Les Comores',2],
    ['Côte d\'Ivoire',2],
    ['Djibouti',2],
    ['Gabon',2],
    ['Guinée',2],
    ['Madagascar',2],
    ['Mali',2],
    ['Niger',2],
    ['République centrafricaine',2],
    ['Congo',2],
    ['Rwanda',2],
    ['Sénégal',2],
    ['Seychelles',2],
    ['Tchad',2],
    ['Togo',2],
    ['Algérie',3],
    ['Israël',3],
    ['Jordanie',3],
    ['Liban',3],
    ['Libye',3],
    ['Maroc',3],
    ['Palestine',3],
    ['Tunisie',3]
  ]);

  get i18nCountryCounts() {
    if (!this._i18nCountryCounts) {
      this._i18nCountryCounts = this.args.areas.reduce((current, area) => {
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
                  } else {
                    console.log(challenge.area);
                  }
                  return current;
                }, current);
              }
              return current;
            }, current);
          }, [[0,0],[0,0],[0,0],[0,0]]);
          return current;
        }, current);
      }, {});
    }
    return this._i18nCountryCounts;
  }

  get i18nData() {
    if (!this._i18nData) {
      this._i18nData = this.args.competenceCodes.map(code => ({
        name:code,
        neutralValidated:this.i18nCountryCounts[code][0][0],
        neutralSuggested:this.i18nCountryCounts[code][0][1],
        occidentValidated:this.i18nCountryCounts[code][2][0],
        occidentSuggested:this.i18nCountryCounts[code][2][1],
        africaValidated:this.i18nCountryCounts[code][2][0],
        africaSuggested:this.i18nCountryCounts[code][2][1],
        unescoValidated:this.i18nCountryCounts[code][3][0],
        unescoSuggested:this.i18nCountryCounts[code][3][1]
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

  get i18nOccidentTotal() {
    if (!this._i18nOccidentTotal) {
      this._i18nOccidentTotal = Object.values(this.i18nData).reduce((current, value) => {
        current.validated+=value.occidentValidated;
        current.suggested+=value.occidentSuggested;
        return current;
      }, {validated:0, suggested:0});
    }
    return this._i18nOccidentTotal;
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
      this._i18nWorldSkills = this.args.areas.reduce((current, area) => {
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
      this._i18nEuropeanSkills = this.args.areas.reduce((current, area) => {
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
      this._i18nFrenchSkills = this.args.areas.reduce((current, area) => {
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
