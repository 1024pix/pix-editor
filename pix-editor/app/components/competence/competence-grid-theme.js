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
    return this.args.theme.tubeOverviews.filter((tube) => this.shouldDisplayTube(tube));
  }

  get rowSpanTheme() {
    return this.tubes.length;
  }

  get hasNoTubes() {
    return this.rowSpanTheme === 0;
  }

  get areProductionTubesEmpty() {
    return this.tubes.every(isProductionTubeEmpty);
  }

  get isThemeEmpty() {
    return this.hasNoTubes || this.areProductionTubesEmpty;
  }

  get isInProductionView() {
    return this.args.view === 'production';
  }

  get shouldHideThematic() {
    return this.isInProductionView && this.isThemeEmpty;
  }

  shouldDisplayTube(tube) {
    return !(this.isInProductionView && isProductionTubeEmpty(tube));
  }
}

function isProductionTubeEmpty(tube) {
  return tube?.enProductionSkillViews?.length === 0;
}
