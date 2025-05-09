import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PopinSelectLocation extends Component {

  @tracked disableActionButton = this.args.variant !== 'skill';

  get actionButtonTitle() {
    if (this.args.variant === 'skill') {
      return 'Dupliquer';
    }
    return 'Déplacer';
  }

  @action
  closeModal() {
    this.args.close();
  }

  @action
  setIsSubmittable(value) {
    this.disableActionButton = !value;
  }

  @action
  onSubmit(...args) {
    this.args.onSubmit(...args);
    this.closeModal();
  }
}
