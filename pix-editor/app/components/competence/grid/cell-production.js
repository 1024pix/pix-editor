import Component from '@glimmer/component';

export default class CellProduction extends Component {
  get alertCSS() {
    if (this.args.skillOverview.validatedChallengesCount > 0) {
      return '';
    }
    if (this.args.skillOverview.proposedChallengesCount > 0) {
      return 'warning';
    }
    return 'danger';
  }
}
