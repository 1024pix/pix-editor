import Component from '@glimmer/component';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { eq } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

export default class AdminEntityFormInput extends Component {
  get isString() {
    return this.args.type === 'string';
  }

  get isNumber() {
    return this.args.type === 'number';
  }

  get isPassword() {
    return this.args.type === 'secret';
  }

  get isSelect() {
    return this.args.type === 'enum';
  }

  get validationStatus() {
    return this.args.error !== null ? 'error' : undefined;
  }

  @action
  onInputChange(inputEvent) {
    const newValue = this.isNumber ? Number(inputEvent.target.value) : inputEvent.target.value;
    this.args.onChange(newValue);
  }

  <template>
    {{#if this.isString}}
      <PixInput
        @id="{{@key}}"
        @requiredLabel="Champ obligatoire"
        @value={{@value}}
        @errorMessage={{@error}}
        @validationStatus={{this.validationStatus}}
        autocomplete="off"
        type="text"
        {{on "change" this.onInputChange}}
      >
        <:label>
          {{@label}}
        </:label>
      </PixInput>
    {{else if this.isPassword}}
      <PixInputPassword
        @id="{{@key}}"
        @requiredLabel="Champ obligatoire"
        @value={{@value}}
        @errorMessage={{@error}}
        @validationStatus={{this.validationStatus}}
        autocomplete="off"
        {{on "change" this.onInputChange}}
      >
        <:label>
          {{@label}}
        </:label>
      </PixInputPassword>
    {{else if this.isNumber}}
      <PixInput
        @id="{{@key}}"
        @requiredLabel="Champ obligatoire"
        @value={{@value}}
        @errorMessage={{@error}}
        @validationStatus={{this.validationStatus}}
        autocomplete="off"
        type="number"
        {{on "change" this.onInputChange}}
      >
        <:label>
          {{@label}}
        </:label>
      </PixInput>
    {{else if this.isSelect}}
      <PixSelect
        @id="{{@key}}"
        @options={{@options}}
        @value={{@value}}
        @onChange={{@onChange}}
        @requiredLabel="Champ obligatoire"
        @hideDefaultOption={{true}}
        @errorMessage={{@error}}
      >
        <:label>
          {{@label}}
        </:label>
      </PixSelect>
    {{/if}}
  </template>
}
