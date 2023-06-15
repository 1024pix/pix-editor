import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PopinSingleEntry extends Component {

  @tracked value = '';

  constructor() {
    super(...arguments);
    if (this.args.labelValue) {
      this.value = this.args.labelValue;
    }
  }

  get title() {
    return this.args.title ? this.args.title : 'no_single_entry_title';
  }

  @action
  validate(e) {
    e.preventDefault();
    this.args.setValue(this.value);
    this.closeModal();
  }

  @action
  closeModal() {
    this.value = '';
    this.args.close();
  }
}
