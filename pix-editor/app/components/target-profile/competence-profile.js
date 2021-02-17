import Component from '@glimmer/component';

export default class CompetenceProfile extends Component {

  get filteredTheme() {
    const competence = this.args.competence;
    if (this.args.filter) {
      return competence.themes.filter(theme => theme.hasSelectedProductionTube);
    }
    return competence.themes;
  }

}
