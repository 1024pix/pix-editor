import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class SelectSearch extends Component {
  @action
  async onSelectFocus() {
    const [searchInput] = document.getElementById(this.args.selectId).getElementsByClassName('pix-select-search__input');
    const [emptyMessage] = document.getElementById(this.args.selectId).getElementsByClassName('pix-select-list__empty-search-message');
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value;
      if (query.length) {
        emptyMessage.innerHTML = 'Recherche en cours...';
        this.args.getResults(query);
      } else {
        emptyMessage.innerHTML = 'Aucun résultat';
        this.args.setResultList([]);
      }
    });
  }

  <template>
    <PixSelect
      {{on "focusout" this.onSelectFocus}}
      id={{@selectId}}
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
