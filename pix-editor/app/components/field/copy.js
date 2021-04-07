import Component from '@glimmer/component';
import { action } from '@ember/object';


export default class FieldCopyComponent extends Component {

  @action
  copy(element) {
    element.select();
    try {
      var successful = document.execCommand('copy');
      this.args.onCopied(successful);
    } catch (err) {
      this.args.onCopied(false);
    }
  }
}
