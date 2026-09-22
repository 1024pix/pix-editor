import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Select from 'pixeditor/components/field/select';

// TRADUCTIONS PIXSELECT
const selectTranslationList = {
  emptySearchMessage: 'Pas de résultat',
  placeholder: 'Acquix ou recordId',
  searchPlaceholder: '@patate1, recABCD1234',
};

export default class SidebarSearch extends Component {
  routeModel = null;

  @service store;
  @service router;
  @tracked searchResults = [];

  get searchResultOptions() {
    return this.searchResults.map((result) => ({
      value: result.transition,
      label: `${result.statusIcon} ${result.title}${result.version ? ` v${result.version}` : ''}`,
    }));
  }

  @action
  async getSearchResults(query) {
    query = query.trim();
    if (query.length === 0) {
      this.searchResults = [];
      return this.searchResults;
    }
    this.searchResults = await this.store.query('search-result', {
      filter: {
        name: query,
      },
    });
    return this.searchResults;
  }

  @action
  transitionTo(transition) {
    this.args.close();
    this.router.transitionTo(...transition);
  }

  <template>
    <Select
      @isSearchable={{true}}
      @options={{this.searchResultOptions}}
      @onSearch={{this.getSearchResults}}
      @onChange={{this.transitionTo}}
      @iconName="search"
      @value=""
      @hideDefaultOption={{true}}
      @screenReaderOnly={{true}}
      class="sidebar-search"
      @texts={{selectTranslationList}}
    >
      <:label>
        Rechercher un acquis ou une épreuve...
      </:label>
    </Select>
  </template>
}
