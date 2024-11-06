import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CompetenceFooter extends Component {

  @service access;

  get isOverview() {
    return this.args.competenceOverview != null;
  }

  get tubesCount() {
    if (this.isOverview) {
      return this.args.competenceOverview.tubesCount;
    }
    return this.displayProductionStats
      ? this.args.competence.productionTubeCount
      : this.args.competence.tubeCount;
  }

  get skillsCount() {
    if (this.isOverview) {
      return this.args.competenceOverview.skillsCount;
    }
    return this.displayProductionStats
      ? this.args.competence.productionSkillCount
      : this.args.competence.skillCount;
  }

  get skillClass() {
    return this.args.section === 'skills' ? ' skill-mode ' : '';
  }

  get displayWorkbenchViews() {
    return this.args.section === 'challenges' && this.args.view !== 'production';
  }

  get displayProductionStats() {
    const section = this.args.section;
    return section === 'quality' || (section === 'challenges' && this.args.view === 'production');
  }

  get mayCreateTheme() {
    const section = this.args.section;
    const view = this.args.view;
    return section === 'skills' && view === 'workbench' && this.access.mayCreateTheme();
  }

  get mayCreatePrototype() {
    const section = this.args.section;
    const view = this.args.view;
    return section === 'challenges' && (view === 'workbench' || view === 'workbench-list') && this.access.mayCreatePrototype();
  }
}
