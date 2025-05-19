import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class SelectSearch extends Component {
  @action
  onSelectFocus() {
    const searchInput = document.querySelector(`#container-${this.args.selectId} .pix-select-search__input`);
    const emptyMessage = document.querySelector(`#container-${this.args.selectId} .pix-select-list__empty-search-message`);
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value;
      if (query.length) {
        emptyMessage.innerHTML = 'Recherche en cours...';
        await this.args.getResults(query);
      } else {
        emptyMessage.innerHTML = 'Aucun résultat';
        this.args.setResultList([]);
      }
    });
  }

  get searchLabel() {
    return this.args.searchLabel ?? 'Rechercher';
  }

  <template>
    <PixSelect
      {{on "focusout" this.onSelectFocus}}
      @id={{@selectId}}
      @options={{@resultList}}
      @onChange={{@onChange}}
      @isSearchable={{true}}
      @searchLabel="Rechercher"
      @searchPlaceholder={{@searchPlaceholder}}
      @emptySearchMessage="Aucun résultat"
      @placeholder="Rechercher"
    />
  </template>
}
