import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';

export default class Input extends Component {

  get safeHelpContent() {
    return htmlSafe(this.args.helpContent);
  }

  @action
  change(evt) {
    this.args.change?.(evt.target.value);
  }
}
