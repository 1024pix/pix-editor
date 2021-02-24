import Component from '@glimmer/component';

export default class CompetenceCompetenceGridThemeComponent extends Component {
  get isWorkbenchSkillView() {
    return this.args.view === 'workbench' && this.args.section === 'skills';
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
