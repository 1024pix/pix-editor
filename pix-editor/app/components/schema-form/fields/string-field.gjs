import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

/**
 * Champ texte pour les propriétés de type `string`.
 *
 * Adapte le type d'input selon le `format` du schema :
 *   - uuid  → lecture seule (auto-généré)
 *   - uri   → input type="url"
 *   - email → input type="email"
 *   - null  → input type="text"
 */
export default class StringField extends Component {
  get infoText() {
    return this.args.schema?.options?.infoText ?? null;
  }

  get isReadOnly() {
    return this.args.schema?.format === 'uuid';
  }

  get inputType() {
    switch (this.args.schema?.format) {
      case 'uri':
        return 'url';
      case 'email':
        return 'email';
      default:
        return 'text';
    }
  }

  @action
  handleInput(event) {
    this.args.onChange?.(event.target.value);
  }

  <template>
    <div class='schema-form-field'>
      <label class='schema-form__label'>
        {{@label}}
        {{#if this.isReadOnly}}
          <span class='schema-form__badge schema-form__badge--readonly'>lecture seule</span>
        {{/if}}
      </label>
      {{#if this.infoText}}
        <p class='schema-form__info'>{{this.infoText}}</p>
      {{/if}}
      <input
        type={{this.inputType}}
        value={{@value}}
        readonly={{this.isReadOnly}}
        class='schema-form__input {{if this.isReadOnly "schema-form__input--readonly"}}'
        {{on 'input' this.handleInput}}
      />
    </div>
  </template>
}
