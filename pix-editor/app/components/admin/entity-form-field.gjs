import Component from '@glimmer/component';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { eq } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import { action } from '@ember/object';

export default class AdminEntityFormField extends Component {
  get isString() {
    return this.args.field.type === 'string';
  }

  get isNumber() {
    return this.args.field.type === 'number';
  }

  get isPassword() {
    return this.args.field.type === 'secret';
  }

  get isSelect() {
    return this.args.field.type === 'enum';
  }

  get validationStatus() {
    return this.args.field.error !== null ? 'error' : undefined;
  }

  onInputChange = (inputEvent) => {
    this.args.onChange(inputEvent.target.value);
  };

  <template>
    {{#if this.isString}}
      <PixInput
        @id="{{@field.key}}"
        @requiredLabel="Champ obligatoire"
        @value={{@field.value}}
        @errorMessage={{@field.error}}
        @validationStatus={{this.validationStatus}}
        autocomplete="off"
        type="text"
        {{on "change" this.onInputChange}}
      >
        <:label>
          {{@field.label}}
        </:label>
      </PixInput>
    {{else if this.isPassword}}
      <PixInputPassword
        @id="{{@field.key}}"
        @requiredLabel="Champ obligatoire"
        @value={{@field.value}}
        @errorMessage={{@field.error}}
        @validationStatus={{this.validationStatus}}
        autocomplete="off"
        {{on "change" this.onInputChange}}
      >
        <:label>
          {{@field.label}}
        </:label>
      </PixInputPassword>
    {{else if this.isNumber}}
      <PixInput
        @id="{{@field.key}}"
        @requiredLabel="Champ obligatoire"
        @value={{@field.value}}
        @errorMessage={{@field.error}}
        @validationStatus={{this.validationStatus}}
        autocomplete="off"
        type="number"
        {{on "change" this.onInputChange}}
      >
        <:label>
          {{@field.label}}
        </:label>
      </PixInput>
    {{else if this.isSelect}}
      <PixSelect
        @id="{{@field.key}}"
        @options={{@field.options}}
        @value={{@field.value}}
        @onChange={{@onChange}}
        @requiredLabel="Champ obligatoire"
        @hideDefaultOption={{true}}
        @errorMessage={{@field.error}}
      >
        <:label>
          {{@field.label}}
        </:label>
      </PixSelect>
    {{/if}}
  </template>
}
