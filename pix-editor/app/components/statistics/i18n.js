import Component from '@glimmer/component';

const NEUTRAL = 0;
const OCCIDENT = 1;
const AFRICA = 2;
const UNESCO = 3;
export default class StatisticsI18nComponent extends Component {

  _i18nAreas = new Map([
    ['Neutre',NEUTRAL],
    ['Institutions internationales',NEUTRAL],
    ['Allemagne',OCCIDENT],
    ['Argentine', OCCIDENT],
    ['Belgique', OCCIDENT],
    ['Brésil',OCCIDENT],
    ['Canada', OCCIDENT],
    ['Chine', OCCIDENT],
    ['Espagne', OCCIDENT],
    ['France', OCCIDENT],
    ['Grèce', OCCIDENT],
    ['Italie', OCCIDENT],
    ['Japon', OCCIDENT],
    ['Mexique', OCCIDENT],
    ['Portugal', OCCIDENT],
    ['Suisse', OCCIDENT],
    ['UK', OCCIDENT],
    ['USA', OCCIDENT],
    ['Vénézuela', OCCIDENT],
    ['Bénin', AFRICA],
    ['Burkina Faso', AFRICA],
    ['Burundi',AFRICA],
    ['Cameroun',AFRICA],
    ['Les Comores',AFRICA],
    ['Côte d\'Ivoire',AFRICA],
    ['Djibouti',AFRICA],
    ['Gabon',AFRICA],
    ['Guinée',AFRICA],
    ['Madagascar',AFRICA],
    ['Mali',AFRICA],
    ['Niger',AFRICA],
    ['République centrafricaine',AFRICA],
    ['Congo',AFRICA],
    ['Rwanda',AFRICA],
    ['Sénégal',AFRICA],
    ['Seychelles',AFRICA],
    ['Tchad',AFRICA],
    ['Togo',AFRICA],
    ['Algérie',UNESCO],
    ['Israël',UNESCO],
    ['Jordanie',UNESCO],
    ['Liban',UNESCO],
    ['Libye',UNESCO],
    ['Maroc',UNESCO],
    ['Palestine',UNESCO],
    ['Tunisie',UNESCO]
  ]);

  get i18nCountryCounts() {
    return this.args.areas.reduce((current, area) => {
      return area.competences.reduce((current, competence) => {
        const competenceCountries =  competence.tubes.reduce((current, tube) => {
          return tube.productionSkills.reduce((current, skill) => {
            if (skill.i18n === 'Monde') {
              return skill.challenges.reduce((current, challenge) => {
                const area = challenge.area;
                if (!current.has(area)) {
                  current.set(area, [0,0]);
                }
                const value = current.get(area);
                if (challenge.isValidated) {
                  value[0]++;
                  current.set(area, value);
                } else if (challenge.isDraft) {
                  value[1]++;
                  current.set(area, value);
                }
                return current;
              }, current);
            }
            return current;
          }, current);
        }, new Map());

        const countries = current.countries;
        const areaCounts = [[0,0],[0,0],[0,0],[0,0]];

        for (const [country, values] of competenceCountries) {
          if (!countries.has(country)) {
            countries.set(country, values);
          } else {
            const counts = countries.get(country);
            countries.set(country, [counts[0] + values[0], counts[1] + values[1]]);
          }
          if (this._i18nAreas.has(country)) {
            const index = this._i18nAreas.get(country);
            areaCounts[index][0] += values[0];
            areaCounts[index][1] += values[1];
          }
        }
        current.areas[competence.code] = areaCounts;
        return current;
      }, current);
    }, { areas:{}, countries:new Map() });
  }

  get i18nData() {
    const areaCounts = this.i18nCountryCounts.areas;
    return this.args.competenceCodes.map(code => ({
      name:code,
      neutralValidated:areaCounts[code][0][0],
      neutralSuggested:areaCounts[code][0][1],
      occidentValidated:areaCounts[code][1][0],
      occidentSuggested:areaCounts[code][1][1],
      africaValidated:areaCounts[code][2][0],
      africaSuggested:areaCounts[code][2][1],
      unescoValidated:areaCounts[code][3][0],
      unescoSuggested:areaCounts[code][3][1]
    }));
  }

  i18nTotal(validatedKey, suggestedKey) {
    return Object.values(this.i18nData).reduce((current, value) => {
      current.validated += value[validatedKey];
      current.suggested += value[suggestedKey];
      return current;
    }, { validated:0, suggested:0 });
  }
  
  get i18nNeutralTotal() {
    return this.i18nTotal('neutralValidated', 'neutralSuggested');
  }

  get i18nAfricaTotal() {
    return this.i18nTotal('africaValidated', 'africaSuggested');
  }

  get i18nOccidentTotal() {
    return this.i18nTotal('occidentValidated', 'occidentSuggested');
  }

  get i18nUnescoTotal() {
    return this.i18nTotal('unescoValidated', 'unescoSuggested');
  }

  i18nSkills(region) {
    return this.args.areas.reduce((current, area) => {
      return area.competences.reduce((current, competence) => {
        return competence.tubes.reduce((current, tube) => {
          return tube.productionSkills.reduce((current, skill) => {
            if (skill.i18n === region) {
              current++;
            }
            return current;
          }, current);
        }, current);
      }, current);
    }, 0);
  }
  get i18nWorldSkills() {
    return this.i18nSkills('Monde');
  }

  get i18nEuropeanSkills() {
    return this.i18nSkills('Union Européenne');
  }

  get i18nFrenchSkills() {
    return this.i18nSkills('France');
  }

  i18nCountries(countryCode) {
    const countries = this.i18nCountryCounts.countries;
    const names = Array.from(countries.keys()).filter(name => this._i18nAreas.get(name) === countryCode);
    return names.reduce((current, name) => {
      const values = countries.get(name);
      current.push({ name:name, validated:values[0], suggested:values[1] });
      return current;
    }, []);
  }

  get i18nOccidentCountries() {
    return this.i18nCountries(OCCIDENT);
  }

  get i18nAfricanCountries() {
    return this.i18nCountries(AFRICA);
  }

  get i18nUnescoCountries() {
    return this.i18nCountries(UNESCO);
  }

}
