import Component from '@glimmer/component';
import { action } from '@ember/object';


export default class PopInNewFrameworkComponent extends Component {

  get hasEmptyMandatoryField() {
    const framework = this.args.framework;
    return this._fieldIsEmpty(framework?.name);
  }

  _fieldIsEmpty(field) {
    return field === undefined || field.trim() === '';
  }

  @action
  saveOnSubmit(e) {
    e.preventDefault();
    if (!this.hasEmptyMandatoryField) {
      this.args.save();
    }
  }
}
