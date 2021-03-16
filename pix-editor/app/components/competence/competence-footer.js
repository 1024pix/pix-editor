import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CompetenceFooter extends Component {

  @service access;

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

  get mayCreateTube() {
    const section = this.args.section;
    const view = this.args.view;
    return section === 'skills' && view === 'workbench' && this.access.mayCreateTube();
  }

  get mayCreatePrototype() {
    const section = this.args.section;
    const view = this.args.view;
    return section === 'challenges' && (view === 'workbench' || view === 'workbench-list') && this.access.mayCreatePrototype();
  }
}
