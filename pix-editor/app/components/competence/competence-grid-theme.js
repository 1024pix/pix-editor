import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class CompetenceCompetenceGridThemeComponent extends Component {

  @service access;

  get mayCreateTube() {
    const section = this.args.section;
    const view = this.args.view;
    return section === 'skills' && view === 'workbench' && this.access.mayCreateTube();
  }

  get tubesOrProductionTubes() {
    const theme = this.args.theme;
    if (this.args.view === 'workbench') {
      return theme.tubes;
    }
    return theme.productionTubes;
  }

  get rowSpanTheme() {
    return this.tubesOrProductionTubes.length;
  }

  get hasNoTubes() {
    const theme = this.args.theme;
    return theme.tubes.length === 0;
  }
}
