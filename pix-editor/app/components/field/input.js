import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class Input extends Component {

  @action
  change(evt) {
    this.args.change?.(evt.target.value);
  }
}
