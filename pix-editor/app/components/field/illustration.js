import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class Illustration extends Component {
  @action
  remove() {
    this.args.removeIllustration();
    this.args.setValue([]);
  }

  @action
  add(file) {
    this.args.setValue([{ file }]);
  }
}
