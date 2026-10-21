import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class BooleanField extends Component {
  get infoText() {
    return this.args.schema?.options?.infoText ?? null;
  }

  @action
  handleChange(event) {
    this.args.onChange?.(event.target.checked);
  }

  <template>
    <div class='schema-form-field schema-form-field--boolean'>
      <label class='schema-form__label schema-form__label--inline'>
        <input
          type='checkbox'
          checked={{@value}}
          class='schema-form__checkbox'
          {{on 'change' this.handleChange}}
        />
        {{@label}}
      </label>
      {{#if this.infoText}}
        <p class='schema-form__info'>{{this.infoText}}</p>
      {{/if}}
    </div>
  </template>
}
