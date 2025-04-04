import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class SelectSearch extends Component {
  @action
  async onSelectFocus() {
    const containerElement = document.getElementById(`container-${this.args.selectId}`);
    const [searchInput] = containerElement.getElementsByClassName('pix-select-search__input');
    const [emptyMessage] = containerElement.getElementsByClassName('pix-select-list__empty-search-message');
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

  get placeholder() {
    return this.args.placeholder || 'Rechercher...';
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
      @hideDefaultOption={{@hideDefaultOption}}
      @placeholder={{this.placeholder}}
    />
  </template>
}
