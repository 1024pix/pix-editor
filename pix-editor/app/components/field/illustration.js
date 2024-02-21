import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class Illustration extends Component {
  @action
  remove() {
    this.args.removeIllustration();
  }

  @action
  async add(file) {
    await this.args.removeIllustration();
    this.args.addIllustration(file);
  }
}
