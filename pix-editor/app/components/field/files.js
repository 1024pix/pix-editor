import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class Files extends Component {
  @service filePath;

  @action
  remove(file) {
    this.args.removeAttachment(file);
  }

  @action
  add(file) {
    this.args.addAttachment(file);
  }
}
