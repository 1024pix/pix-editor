import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import Input from 'pixeditor/components/field/input';

export default class PopInNewFrameworkComponent extends Component {
  <template>
    <PixModal @title="Créer un référentiel" @onCloseButtonClick={{@close}} @showModal={{@showModal}}>
      <:content>
        {{#if @framework}}
          <form action class="form" {{on "submit" this.saveOnSubmit}}>
            <Input @value={{@framework.name}} @edition={{true}} @label="Nom" @change={{this.setFrameWorkName}} />
          </form>
        {{/if}}
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{@close}}>
          Annuler
        </PixButton>
        <PixButton @iconAfter="check" @triggerAction={{@save}} @isDisabled={{this.hasEmptyMandatoryField}}>
          Enregistrer
        </PixButton>
      </:footer>
    </PixModal>
  </template>

  get hasEmptyMandatoryField() {
    const framework = this.args.framework;
    return this._fieldIsEmpty(framework?.name);
  }

  _fieldIsEmpty(field) {
    return field === undefined || field.trim() === '';
  }

  @action
  setFrameWorkName(value) {
    this.args.framework.name = value;
  }

  @action
  saveOnSubmit(e) {
    e.preventDefault();
    if (!this.hasEmptyMandatoryField) {
      this.args.save();
    }
  }
}
