import Component from '@glimmer/component';

export default class CellProduction extends Component {

  get productionChallengesFilteredByLanguage() {
    const productionAlternatives = this.args.skill.productionPrototype.productionAlternatives;
    const productionChallenges = [...productionAlternatives, this.args.skill.productionPrototype];
    return this._filterChallengesByLanguage(productionChallenges);
  }

  get draftAlternativesFilteredByLanguage() {
    const draftAlternatives = this.args.skill.productionPrototype.draftAlternatives;
    return this._filterChallengesByLanguage(draftAlternatives);
  }

  _filterChallengesByLanguage(challenges) {
    const languageFilter = this.args.languageFilter;
    if (languageFilter) {
      const filteredChallenges = challenges.filter(challenge => {
        return challenge.locales?.includes(languageFilter);
      });
      return filteredChallenges.length;
    }
    return challenges.length;
  }

  get alertCSS() {
    if (this.productionChallengesFilteredByLanguage > 0) {
      return '';
    }
    if (this.draftAlternativesFilteredByLanguage > 0) {
      return 'warning';
    }
    return 'danger';
  }
}
