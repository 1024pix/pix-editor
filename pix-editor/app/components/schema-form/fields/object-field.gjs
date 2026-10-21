import { fn, get } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';

import SchemaFormField from '../field';

/**
 * Rend les propriétés d'un objet JSON schema.
 *
 * Gère aussi le pattern `if/then/otherwise` utilisé pour les composants
 * dont les propriétés varient selon la valeur d'un champ discriminant
 * (ex. `components` : les propriétés du stepper s'ajoutent quand type === "stepper").
 */
export default class ObjectField extends Component {
  get infoText() {
    return this.args.schema?.options?.infoText ?? null;
  }

  get entries() {
    const schema = this.args.schema;
    const baseProperties = schema.properties ?? {};

    // Gestion du pattern if/then (ex. components : element vs stepper)
    if (schema.if?.properties && schema.then?.properties) {
      const [condKey, condDef] = Object.entries(schema.if.properties)[0];
      const condValue = condDef?.const;
      const currentValue = this.args.value?.[condKey];

      if (currentValue === condValue) {
        const mergedProperties = { ...baseProperties, ...schema.then.properties };
        return Object.entries(mergedProperties).map(([key, propSchema]) => ({ key, propSchema }));
      }
    }

    return Object.entries(baseProperties).map(([key, propSchema]) => ({ key, propSchema }));
  }

  @action
  handlePropertyChange(key, newPropertyValue) {
    this.args.onChange?.({
      ...(this.args.value ?? {}),
      [key]: newPropertyValue,
    });
  }

  <template>
    <fieldset class='schema-form-object'>
      {{#if @label}}
        <legend class='schema-form-object__legend'>{{@label}}</legend>
      {{/if}}
      {{#if this.infoText}}
        <p class='schema-form__info'>{{this.infoText}}</p>
      {{/if}}
      {{#each this.entries as |entry|}}
        <SchemaFormField
          @schema={{entry.propSchema}}
          @value={{get @value entry.key}}
          @onChange={{fn this.handlePropertyChange entry.key}}
          @label={{entry.key}}
        />
      {{/each}}
    </fieldset>
  </template>
}
