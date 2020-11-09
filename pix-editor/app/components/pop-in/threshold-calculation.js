import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PopinThresholdCalculation extends Component {

  @action
  closeModal() {
    this.args.close();
  }
}
