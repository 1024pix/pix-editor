import Component from '@glimmer/component';

export default class CellProduction extends Component {

  get alertCSS() {
    if (this.args.skill.validatedChallengesCount > 0) {
      return '';
    }
    if (this.args.skill.proposedChallengesCount > 0) {
      return 'warning';
    }
    return 'danger';
  }
}
