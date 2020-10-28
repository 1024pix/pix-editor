import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class Mde extends Component {

  get safeHelpContent() {
    return htmlSafe(this.args.helpContent);
  }

}
