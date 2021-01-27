import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class Files extends Component {
  @service filePath;

  @action
  remove(index) {
    // clone instead of removeAt, so that rollbackAttributes
    // may work
    const list = this.args.value.slice();
    const [removedAttachment] = list.splice(index, 1);
    this.args.setValue(list);
    this.args.removeAttachment(removedAttachment);
  }

  @action
  add(file) {
    const value = this.args.value;
    const list = value ? value.slice() : [];
    list.unshift({ file, url: '', filename: file.name });
    this.args.setValue(list);
  }
}
