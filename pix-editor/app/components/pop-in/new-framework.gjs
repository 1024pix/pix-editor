import { action } from '@ember/object';
import Component from '@glimmer/component';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import Input from 'pix-editor/components/field/input';
import PixButton from '@1024pix/pix-ui/components/pix-button';

export default class PopInNewFrameworkComponent extends Component {
  <template>
    <PixModal @title="Créer un référentiel" @onCloseButtonClick={{@close}} @showModal={{@showModal}}>
      <:content>
        {{#if @framework}}
          <form action class="ui form" {{on "submit" this.saveOnSubmit}}>
            <Input data-test-framework-name-input @value={{@framework.name}} @edition={{true}} @title="Nom" />
          </form>
        {{/if}}
      </:content>
      <:footer>
        <PixButton @backgroundColor="transparent-light" @isBorderVisible={{true}} @triggerAction={{@close}}>
          Annuler
        </PixButton>
        <PixButton data-test-save-action @triggerAction={{@save}} @isDisabled={{this.hasEmptyMandatoryField}}>
          Enregistrer
          <i class="save icon"></i>
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
  saveOnSubmit(e) {
    e.preventDefault();
    if (!this.hasEmptyMandatoryField) {
      this.args.save();
    }
  }
}
