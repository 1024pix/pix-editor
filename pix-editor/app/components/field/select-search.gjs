import PixSearchInput from '@1024pix/pix-ui/components/pix-search-input';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class SelectSearch extends Component {
  selectSearchId = `select-search-${guidFor(this)}`;

  @tracked isQuerying = false;

  get debounce() {
    return 100;
  }

  get noResult() {
    return this.args.options.length === 0 && this.isQuerying;
  }

  @action
  async onSearchValueInput(_, value) {
    this.isQuerying = value.length > 0;
    return this.args.onSearch(value);
  }

  @action
  onSelectItem(item, e) {
    e.preventDefault();
    this.args.onSelect(item);
    this.isQuerying = false;
  }

  @action
  hideResults(e) {
    if (document.getElementById(this.selectSearchId).contains(e.relatedTarget)) return;
    this.isQuerying = false;
  }

  getDefaultOptionLabel(option) {
    return option?.label ?? option;
  }

  <template>
    <div id={{this.selectSearchId}} class="select-search" ...attributes>
      <PixSearchInput
        @placeholder={{@searchPlaceholder}}
        @debounceTimeInMs={{this.debounce}}
        @triggerFiltering={{this.onSearchValueInput}}
        @class="search-input"
        autocomplete="off"
        {{on "focusout" this.hideResults}}
      >
        <:label>{{@searchLabel}}</:label>
      </PixSearchInput>

      {{#if this.isQuerying}}
        <ul role="listbox" class="results-list" aria-busy="{{@isLoading}}">
          {{#if @isLoading}}
            <div class="result-info" role="progressbar">
              Recherche en cours...
            </div>
          {{else if this.noResult}}
            <div class="result-info">
              Pas de résultat
            </div>
          {{else}}
            {{#each @options as |option|}}
              <button class="result-option" type="button" {{on "click" (fn this.onSelectItem option)}}>
                {{#if (has-block "option")}}
                  {{yield option to="option"}}
                {{else}}
                  {{this.getDefaultOptionLabel option}}
                {{/if}}
              </button>
            {{/each}}
          {{/if}}
        </ul>
      {{/if}}
    </div>
  </template>
}
