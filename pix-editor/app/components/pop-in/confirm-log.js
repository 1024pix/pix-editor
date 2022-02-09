import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';


export default class PopInConfirmLog extends Component {
  @tracked displayTextarea = false;
  @tracked defaultValue = this.args.defaultValue;
  inputId = this.args.inputId;

  get changeLogValue() {
    if (this.displayTextarea) {
      return this.defaultValue;
    }
    return null;
  }
}
