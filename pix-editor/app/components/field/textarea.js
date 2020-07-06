import {action} from '@ember/object';
import Component from '@glimmer/component';
import {htmlSafe} from '@ember/template';
import {tracked} from '@glimmer/tracking';

export default class Textarea extends Component {

  @tracked maximized = false;

  get safeHelpContent() {
    return htmlSafe(this.args.helpContent);
  }

  @action
  toggleMaximized() {
    this.maximized = !this.maximized;
  }
}
