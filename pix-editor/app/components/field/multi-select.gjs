import { PixMultiSelect } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

function normalize(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default class MultiSelect extends Component {
  @tracked search = '';

  get texts() {
    return {
      emptySearchMessage: 'Aucun résultat',
      searchLabel: 'Rechercher',
      ...this.args.texts,
    };
  }

  get options() {
    const options = this.args.options ?? [];
    const search = normalize(this.search);
    if (this.args.onSearch || !search) return options;
    return options.filter(({ label }) => normalize(label).includes(search));
  }

  // Calculé à partir de toutes les options : les éléments sélectionnés restent affichés pendant une recherche.
  get placeholder() {
    const values = this.args.values ?? [];
    const selectedLabels = (this.args.options ?? [])
      .filter(({ value, label }) => values.includes(value) && Boolean(label))
      .map(({ label }) => label);
    return selectedLabels.length > 0 ? selectedLabels.join(', ') : this.texts.placeholder;
  }

  @action
  onSearch(value) {
    if (this.args.onSearch) return this.args.onSearch(value);
    this.search = value;
  }

  <template>
    <PixMultiSelect
      @className={{@className}}
      @id={{@id}}
      @inlineLabel={{@inlineLabel}}
      @isComputeWidthDisabled={{@isComputeWidthDisabled}}
      @isDisabled={{@isDisabled}}
      @isSearchable={{@isSearchable}}
      @onChange={{@onChange}}
      @onSearch={{this.onSearch}}
      @options={{this.options}}
      @placement={{@placement}}
      @screenReaderOnly={{@screenReaderOnly}}
      @size={{@size}}
      @texts={{this.texts}}
      @values={{@values}}
      ...attributes
    >
      <:label>{{yield to="label"}}</:label>
      <:placeholder>{{this.placeholder}}</:placeholder>
      <:default as |option|>
        {{#if (has-block)}}
          {{yield option}}
        {{else}}
          {{option.label}}
        {{/if}}
      </:default>
    </PixMultiSelect>
  </template>
}
