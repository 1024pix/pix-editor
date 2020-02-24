import Component from '@glimmer/component';

export default class CompetenceGrid extends Component {
  get hiddenClass() {
    return this.args.hidden?' hidden ':'';
  }

  get displayAllTubes() {
    return this.args.section === 'skills' || this.args.view === 'workbench';
  }
}
