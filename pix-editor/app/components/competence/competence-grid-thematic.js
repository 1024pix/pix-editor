import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CompetenceCompetenceGridThematicComponent extends Component {

  @service access;

  get isOverview() {
    return this.args.thematicOverview != null;
  }

  get mayCreateTube() {
    const section = this.args.section;
    const view = this.args.view;
    return section === 'skills' && view === 'workbench' && this.access.mayCreateTube();
  }

  get tubes() {
    const thematic = this.args.thematic;
    if (this.args.view === 'workbench') {
      return thematic.tubes;
    }
    return thematic.productionTubes;
  }

  get tubeOverviewsOrTubes() {
    if (this.isOverview) {
      return this.args.thematicOverview.tubeOverviews.map((tubeOverview) => ({
        tubeOverview,
      }));
    }
    return this.tubes.map((tube) => ({ tube }));
  }

  get rowSpan() {
    return this.tubeOverviewsOrTubes.length;
  }

  get hasNoTubes() {
    if (this.args.thematicOverview) return false;
    const thematic = this.args.thematic;
    return thematic.tubes.length === 0;
  }

  get name() {
    return this.isOverview
      ? this.args.thematicOverview.name
      : this.args.thematic.name;
  }
}
