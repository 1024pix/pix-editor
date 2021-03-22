import Component from '@glimmer/component';

export default class CompetenceProfile extends Component {

  get filteredTheme() {
    const competence = this.args.competence;
    if (this.args.filter) {
      return competence.sortedThemes.filter(theme => theme.hasSelectedProductionTube);
    }
    return competence.sortedThemes.filter(theme => theme.hasProductionTubes);
  }

}
