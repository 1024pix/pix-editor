import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class SelectField extends Component {
  get infoText() {
    return this.args.schema?.options?.infoText ?? null;
  }

  get selectOptions() {
    const currentValue = this.args.value;
    return (this.args.schema?.enum ?? []).map((value) => ({
      value,
      selected: value === currentValue,
    }));
  }

  @action
  handleChange(event) {
    this.args.onChange?.(event.target.value);
  }

  <template>
    <div class='schema-form-field'>
      <label class='schema-form__label'>{{@label}}</label>
      {{#if this.infoText}}
        <p class='schema-form__info'>{{this.infoText}}</p>
      {{/if}}
      <select class='schema-form__select' {{on 'change' this.handleChange}}>
        {{#each this.selectOptions as |opt|}}
          <option value={{opt.value}} selected={{opt.selected}}>
            {{opt.value}}
          </option>
        {{/each}}
      </select>
    </div>
  </template>
}
