import { PixFilterBanner, PixSearchInput } from '@1024pix/nebulix-ember';
import { array } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import not from 'ember-truth-helpers/helpers/not';

export default class ModulesFilters extends Component {
  @tracked resetKey = 0;

  @action
  triggerInternalTitleFilter(_id, internalTitle) {
    return this.args.onInternalTitleFilterChange(internalTitle);
  }

  @action
  clearFilters() {
    this.resetKey++;
    return this.args.onClearFilters();
  }

  <template>
    <PixFilterBanner
      @title={{t "modules.components.modules-filters.title"}}
      class="table-filter-banner"
      @clearFiltersLabel={{t "modules.components.modules-filters.clear"}}
      @onClearFilters={{this.clearFilters}}
      @isClearFilterButtonDisabled={{not @internalTitle}}
    >
      {{#each (array this.resetKey) as |_key|}}
        <PixSearchInput
          @id="modules-filter-internal-title"
          @value={{@internalTitle}}
          @debounceTimeInMs={{400}}
          @triggerFiltering={{this.triggerInternalTitleFilter}}
        >
          <:label>{{t "modules.components.modules-filters.internal-title-label"}}</:label>
        </PixSearchInput>
      {{/each}}
    </PixFilterBanner>
  </template>
}
