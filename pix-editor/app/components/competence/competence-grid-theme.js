import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CompetenceCompetenceGridThemeComponent extends Component {

  @service access;

  get mayCreateTube() {
    const section = this.args.section;
    const view = this.args.view;
    return section === 'skills' && view === 'workbench' && this.access.mayCreateTube();
  }

  get tubes() {
    return this.args.theme.tubeOverviews;
  }

  get rowSpanTheme() {
    return this.tubes.length;
  }

  get hasNoTubes() {
    return this.rowSpanTheme === 0;
  }

  get areTubesEmpty() {
    return this.tubes.every((tube) => tube.enProductionSkillViews.length === 0);
  }

  get isThemeEmpty() {
    return this.hasNoTubes || this.areTubesEmpty;
  }

  get isInProductionView() {
    return this.args.view === 'production';
  }
}
