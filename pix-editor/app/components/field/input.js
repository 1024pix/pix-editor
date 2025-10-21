import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class Input extends Component {
  @action
  change(evt) {
    this.args.change?.(evt.target.value);
  }
}
