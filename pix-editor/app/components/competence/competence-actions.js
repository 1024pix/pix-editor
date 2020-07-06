import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CompetenceActions extends Component {
  @service config;

  get skillClass() {
    return this.args.section === 'skills' ? ' skill-mode ' : '';
  }
}
