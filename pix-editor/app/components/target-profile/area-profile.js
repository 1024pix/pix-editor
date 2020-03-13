import Component from '@glimmer/component';

export default class AreaProfile extends Component {

  get filteredCompetences() {
    const area = this.args.area;
    if (this.args.filter) {
      return  area.sortedCompetences.filter(competence => competence.selectedProductionTubeCount > 0)
    }
    return area.sortedCompetences;
  }
}
