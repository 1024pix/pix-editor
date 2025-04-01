import Component from '@glimmer/component';

export default class CompetenceCompetenceGridComponent extends Component {

  get isOverview() {
    return this.args.competenceOverview != null;
  }

  get thematicOverviewsOrThematics() {
    if (this.isOverview) {
      return this.args.competenceOverview.thematicOverviews.map((thematicOverview) => ({
        thematicOverview,
      }));
    }
    return this.args.competence.sortedThemes.map((thematic) => ({ thematic }));
  }
}
