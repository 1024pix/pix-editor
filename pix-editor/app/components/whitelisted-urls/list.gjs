import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import WhitelistedUrlsTable from './table';

export default class WhitelistedUrlsList extends Component {
  @tracked searchUrl;
  @tracked searchNames;

  constructor(...args) {
    super(...args);
    this.searchUrl = this.args.urlFilterValue;
    this.searchNames = this.args.namesFilterValue;
  }

  @action
  async updateUrlFilterValue(event) {
    this.searchUrl = event.target.value;
  }

  @action
  async updateNamesFilterValue(event) {
    this.searchNames = event.target.value;
  }

  @action
  async clearFilters() {
    this.searchUrl = null;
    this.searchNames = null;
    await this.args.onClearFiltersClicked();
  }

  @action
  async applyFilters(event) {
    event.preventDefault();
    await this.args.onApplyFiltersClicked(this.searchUrl, this.searchNames);
  }

  <template>
    <form {{on "submit" this.applyFilters}} class="filter-whitelisted-url-form">
      <PixFilterBanner
        @title="Filtres"
        class="table-filter-banner"
        @clearFiltersLabel="Réinitialiser les filtres"
        @onClearFilters={{this.clearFilters}}
        @isClearFilterButtonDisabled={{false}}
      >
        <PixInput
          @id="whitelisted-url-filter-names"
          placeholder="Nom d'acquis"
          @screenReaderOnly={{true}}
          @value={{@namesFilterValue}}
          {{on "change" this.updateNamesFilterValue}}
        >
          <:label>Nom d'acquis</:label>
        </PixInput>
        <PixInput
          @id="whitelisted-url-filter-url"
          placeholder="URL"
          @screenReaderOnly={{true}}
          @value={{@urlFilterValue}}
          {{on "change" this.updateUrlFilterValue}}
        >
          <:label>URL</:label>
        </PixInput>
        <PixButton
          @type="submit"
        >
          Filtrer
        </PixButton>
      </PixFilterBanner>
    </form>
    <WhitelistedUrlsTable
      @whitelistedUrls={{@whitelistedUrls}}
      @onDeleteWhitelistedUrl={{this.args.onDeleteItemClicked}}
    />
  </template>
}
