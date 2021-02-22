import Component from '@glimmer/component';

export default class CompetenceCompetenceGridThemeComponent extends Component {
  get displayAllTubes() {
    return this.args.view === 'workbench';
  }

  get tubesOrProductionTubes() {
    const theme = this.args.theme;
    if (this.displayAllTubes) {
      return theme.tubes;
    }
    return theme.productionTubes;
  }

  get rowSpanTheme() {
    return this.tubesOrProductionTubes.length;
  }
}
