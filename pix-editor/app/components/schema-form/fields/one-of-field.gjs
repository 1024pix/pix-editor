import { action } from '@ember/object';
import Component from '@glimmer/component';

import SchemaFormField from '../field';
import UnknownField from './unknown-field';

/**
 * Gère les unions discriminées (`oneOf`) du JSON schema.
 *
 * Le champ discriminant est `value.type`, dont la valeur correspond au `title`
 * de chaque variante dans `schema.oneOf`.
 *
 * Comportement critique : si `value.type` ne correspond à aucune variante connue,
 * on affiche UnknownField qui préserve les données SANS les modifier.
 * C'est la correction principale du bug de json-editor qui écrasait silencieusement
 * les types inconnus par un objet `text` par défaut.
 */
export default class OneOfField extends Component {
  get options() {
    return this.args.schema.oneOf ?? [];
  }

  get currentType() {
    return this.args.value?.type ?? null;
  }

  get activeSchema() {
    const type = this.currentType;
    if (!type) return this.options[0] ?? null;
    return this.options.find((s) => s.title === type) ?? null;
  }

  get isUnknownType() {
    const type = this.currentType;
    if (!type) return false;
    return !this.options.some((s) => s.title === type);
  }

  @action
  handleChange(newValue) {
    this.args.onChange?.(newValue);
  }

  <template>
    <div class='schema-form-oneof'>
      {{#if this.isUnknownType}}
        {{! Type présent dans le JSON mais absent du schema : données préservées sans édition }}
        <UnknownField @schema={{@schema}} @value={{@value}} @label={{@label}} />
      {{else if this.activeSchema}}
        <SchemaFormField
          @schema={{this.activeSchema}}
          @value={{@value}}
          @onChange={{this.handleChange}}
          @label={{this.activeSchema.title}}
        />
      {{/if}}
    </div>
  </template>
}
