import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class PopinChangelog extends Component {

  @tracked _value = null;

  get value() {
    if (this._value) {
      return this._value;
    }
    return this.args.defaultValue;
  }

  set value(value) {
    this._value = value;
    return value;
  }

  @action
  deny() {
    this.value = null;
    this.args.onDeny();
  }

  @action
  approve() {
    this.args.onApprove(this.value);
    this.value = null;
  }
}
