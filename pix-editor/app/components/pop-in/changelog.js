import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';


export default class PopinChangelog extends Component {

  @service notify;

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
  approve() {
    this.args.onApprove(this.value);
    this.value = null;
  }

  @action
  onDeny() {
    this.notify.message('Le message de changelog est obligatoire');
  }
}
