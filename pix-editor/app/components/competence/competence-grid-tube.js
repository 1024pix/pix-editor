import Component from '@glimmer/component';

export default class CompetenceCompetenceGridTubeComponent extends Component {
  get isOverview() {
    return this.args.tubeOverview != null;
  }

  get skillOverviewsOrSkills() {
    if (this.isOverview) {
      return this.args.tubeOverview.skillOverviews.map((skillOverview) => ({ skillOverview }));
    }
    if (this.args.view === 'workbench') {
      return this.args.tube.filledSkills.map((skills) => ({ skills, skill: skills[0] }));
    }
    if (this.args.view === 'draft') {
      return this.args.tube.filledLastDraftSkills.map((skill) => ({ skill }));
    }
    return this.args.tube.filledProductionSkills.map((skill) => ({ skill }));
  }

  get name() {
    return this.isOverview
      ? this.args.tubeOverview.name
      : this.args.tube.name;
  }
}
