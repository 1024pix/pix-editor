import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

/**
 * Champ numérique pour les propriétés de type `number` et `integer`.
 *
 * Respecte les contraintes `minimum` et `maximum` du schema.
 * Le `step` est "1" pour les entiers, "any" pour les flottants.
 */
export default class NumberField extends Component {
  get infoText() {
    return this.args.schema?.options?.infoText ?? null;
  }

  get step() {
    return this.args.schema?.type === 'integer' ? '1' : 'any';
  }

  get min() {
    return this.args.schema?.minimum ?? null;
  }

  get max() {
    return this.args.schema?.maximum ?? null;
  }

  @action
  handleInput(event) {
    const raw = event.target.value;
    if (raw === '') {
      this.args.onChange?.(null);
      return;
    }
    const num =
      this.args.schema?.type === 'integer' ? parseInt(raw, 10) : parseFloat(raw);
    if (!isNaN(num)) {
      this.args.onChange?.(num);
    }
  }

  <template>
    <div class='schema-form-field'>
      <label class='schema-form__label'>{{@label}}</label>
      {{#if this.infoText}}
        <p class='schema-form__info'>{{this.infoText}}</p>
      {{/if}}
      <input
        type='number'
        value={{@value}}
        min={{this.min}}
        max={{this.max}}
        step={{this.step}}
        class='schema-form__input'
        {{on 'input' this.handleInput}}
      />
    </div>
  </template>
}
