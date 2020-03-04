import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PopinSingleEntry extends Component {

  @tracked value = '';

  @action
  validate() {
    this.args.setValue(this.value);
    this.closeModal();
  }

  @action
  closeModal() {
    this.value = '';
    this.args.close();
  }
}
