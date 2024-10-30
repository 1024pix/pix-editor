import Component from '@glimmer/component';

export default class CompetenceCompetenceGridTubeComponent extends Component {

  get isOverview() {
    return this.args.tubeOverview != null;
  }

  get skillOverviewsOrSkills() {
    if (this.isOverview) {
      return this.args.tubeOverview.skillOverviews.map((skillOverview) => ({ skillOverview }));
    }
    return this.args.tube.filledProductionSkills.map((skill) => ({ skill }));
  }

  get name() {
    return this.isOverview
      ? this.args.tubeOverview.name
      : this.args.tube.name;
  }
}
