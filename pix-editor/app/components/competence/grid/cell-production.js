import Component from '@glimmer/component';

export default class CellProduction extends Component {

  get productionChallengesFilteredByLanguage() {
    if (this.loadingChallenges) return null;
    const productionAlternatives = this.args.skill.productionPrototype.productionAlternatives;
    const productionChallenges = [...productionAlternatives, this.args.skill.productionPrototype];
    return this._filterChallengesByLanguage(productionChallenges);
  }

  get draftAlternativesFilteredByLanguage() {
    if (this.loadingChallenges) return null;
    return this._filterChallengesByLanguage(this.args.skill.productionPrototype.draftAlternatives);
  }

  get loadingChallenges() {
    return this.args.skill.challenges.isPending;
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
    if (this.loadingChallenges || this.productionChallengesFilteredByLanguage > 0) {
      return '';
    }
    if (this.draftAlternativesFilteredByLanguage > 0) {
      return 'warning';
    }
    return 'danger';
  }
}
