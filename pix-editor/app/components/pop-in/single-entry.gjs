import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import Input from 'pix-editor/components/field/input';
import PixButton from '@1024pix/pix-ui/components/pix-button';

export default class PopinSingleEntry extends Component {
  <template>
    <PixModal @title={{this.title}} @onCloseButtonClick={{this.closeModal}} @showModal={{@showModal}}>
      <:content>
        <label>{{@label}}</label>
        <Input @value={{this.value}} @edition={{true}} />
      </:content>
      <:footer>
        <PixButton @backgroundColor="transparent-light" @isBorderVisible={{true}} @triggerAction={{this.closeModal}}>
          Annuler
        </PixButton>
        <PixButton @triggerAction={{this.validate}}>Valider</PixButton>
      </:footer>
    </PixModal>
  </template>

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
