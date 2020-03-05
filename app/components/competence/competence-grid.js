import Component from '@glimmer/component';

export default class CompetenceGrid extends Component {
  get displayAllTubes() {
    return this.args.section === 'skills' || this.args.view === 'workbench';
  }
}
