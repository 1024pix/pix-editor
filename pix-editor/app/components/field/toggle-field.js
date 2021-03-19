import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';


export default class FieldToggleFieldComponent extends Component {
  @service confirm;

  get shouldDisplayField() {
    return this.args.displayField || !!this.args.model.get(`${this.args.modelField}`);
  }

  get buttonIcon() {
    return this.shouldDisplayField ? 'minus' : 'plus';
  }

  get buttonTitle() {
    return this.shouldDisplayField ? this.args.hideTextButton : this.args.displayTextButton;
  }

  @action
  async toggleFieldDisplay() {
    if (this.shouldDisplayField) {
      await this.confirm.ask('Suppression', `Êtes-vous sûr de vouloir supprimer ${this.args.confirmText} ?`);
      this.args.model.set(`${this.args.modelField}`, '');
      this.args.setDisplayField(false);
    } else {
      this.args.setDisplayField(true);
    }
  }

}
