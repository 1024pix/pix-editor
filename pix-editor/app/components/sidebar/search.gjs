import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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
    <PixSelect
      @isSearchable={{true}}
      @searchPlaceholder="@patate1, recABCD1234"
      @placeholder="Acquix ou recordId"
      @options={{this.searchResultOptions}}
      @onSearch={{this.getSearchResults}}
      @onChange={{this.transitionTo}}
      @iconName="search"
      @value=""
      @hideDefaultOption={{true}}
      class="sidebar-search"
      @emptySearchMessage="Pas de résultat"
    >
      <:label>
        <span class="sr-only">Rechercher un acquis ou une épreuve...</span>
      </:label>
    </PixSelect>
  </template>
}
