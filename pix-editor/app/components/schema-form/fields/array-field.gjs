import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

import { buildDefaultValue } from '../utils/build-default-value';
import SchemaFormField from '../field';

/**
 * Rend un tableau JSON schema : liste d'items avec ajout et suppression.
 *
 * Gère les arrays d'objets simples et les arrays avec `oneOf` (ex. elements,
 * où chaque item peut être un type différent).
 */
export default class ArrayField extends Component {
  get infoText() {
    return this.args.schema?.options?.infoText ?? null;
  }

  get items() {
    return this.args.value ?? [];
  }

  get itemSchema() {
    return this.args.schema.items ?? {};
  }

  get itemLabel() {
    return this.itemSchema.title ?? this.args.label ?? 'élément';
  }

  get canAdd() {
    const { minItems, maxItems } = this.args.schema;
    if (maxItems !== undefined) return this.items.length < maxItems;
    return true;
  }

  get canRemove() {
    const { minItems } = this.args.schema;
    if (minItems !== undefined) return this.items.length > minItems;
    return true;
  }

  @action
  addItem() {
    const defaultValue = buildDefaultValue(this.itemSchema);
    this.args.onChange?.([...this.items, defaultValue]);
  }

  @action
  removeItem(index) {
    const newItems = this.items.filter((_, i) => i !== index);
    this.args.onChange?.(newItems);
  }

  @action
  handleItemChange(index, newItemValue) {
    const newItems = [...this.items];
    newItems[index] = newItemValue;
    this.args.onChange?.(newItems);
  }

  <template>
    <div class='schema-form-array'>
      <div class='schema-form-array__header'>
        {{#if @label}}
          <p class='schema-form__label'>{{@label}}</p>
        {{/if}}
        {{#if this.infoText}}
          <p class='schema-form__info'>{{this.infoText}}</p>
        {{/if}}
      </div>

      <div class='schema-form-array__items'>
        {{#each this.items as |item index|}}
          <div class='schema-form-array__item'>
            <SchemaFormField
              @schema={{this.itemSchema}}
              @value={{item}}
              @onChange={{fn this.handleItemChange index}}
              @label='{{this.itemLabel}} {{index}}'
            />
            {{#if this.canRemove}}
              <button
                type='button'
                class='schema-form-array__remove'
                {{on 'click' (fn this.removeItem index)}}
              >
                Supprimer
              </button>
            {{/if}}
          </div>
        {{/each}}
      </div>

      {{#if this.canAdd}}
        <button type='button' class='schema-form-array__add' {{on 'click' this.addItem}}>
          + Ajouter {{this.itemLabel}}
        </button>
      {{/if}}
    </div>
  </template>
}
