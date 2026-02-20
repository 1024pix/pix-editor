import Component from '@glimmer/component';
import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import { on } from '@ember/modifier';
import { tracked } from '@glimmer/tracking';
import { trackedObject } from '@ember/reactive/collections';
import { action } from '@ember/object';

import AdminEntityFormInput from 'pixeditor/components/admin/entity-form-input';

export default class NewAdminEntityForm extends Component {
  @tracked hasFailedSubmitting = false;

  newEntity = new trackedObject(Object.fromEntries(this.args.entityFields.map((field) => [field.key])));

  get emptyFields() {
    return Object.entries(this.newEntity)
      .filter(([_key, value]) => value === undefined || value.toString().trim() === '')
      .map(([key]) => key);
  }

  get formFields() {
    return this.args.entityFields
      .map((field) => {
        return {
          ...field,
          onChange: (newValue) => {
            this.changeFieldValue(field.key, newValue);
          },
          value: this.newEntity[field.key],
        };
      })
      .map((field) => {
        let error = null;

        if (this.hasFailedSubmitting && this.emptyFields.includes(field.key)) {
          error = 'Ce champ est requis';
        }

        if (!error && field.value && field.pattern) {
          const fieldRegex = new RegExp(field.pattern);
          if (!fieldRegex.test(field.value)) {
            error = `La valeur de ce champ doit respecter l'expression régulière suivante : /${field.pattern}/`;
          }
        }

        return {
          ...field,
          error,
        };
      });
  }

  get hasErrors() {
    return this.emptyFields.length > 0 || this.formFields.some(({ error }) => error);
  }

  @action
  changeFieldValue(fieldKey, value) {
    this.newEntity[fieldKey] = value;
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    if (this.hasErrors) {
      this.hasFailedSubmitting = true;
      return;
    }
    this.hasFailedSubmitting = false;

    this.args.onSubmit(this.newEntity);
  }

  <template>
    <PixBlock class="new-entity-form">
      <form {{on "submit" this.onSubmit}}>
        {{#each this.formFields as |field|}}
          <AdminEntityFormInput
            @key={{field.key}}
            @type={{field.type}}
            @label={{field.label}}
            @options={{field.options}}
            @value={{field.value}}
            @error={{field.error}}
            @onChange={{field.onChange}}
          />
        {{/each}}
        <PixButton @type="submit" @iconBefore="add" @isDisabled={{this.hasErrors}} class="new-entity-form__submit">
          Créer
        </PixButton>
      </form>
    </PixBlock>
  </template>
}
