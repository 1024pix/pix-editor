import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class BrokenUrlList extends Component {
  @tracked sortTable = {
    column: 'url',
    order: 'asc',
  };

  columnSortFunctions = {
    url: (a, b) => a.localeCompare(b),
    statusCode: (a, b) => a - b,
    errorMessage: (a, b) => a.localeCompare(b),
  };

  ariaLabelDefaultSort = 'Rétablir le tri par défaut';
  ariaLabelSortDesc = (label) => `Trier dans l'ordre décroissant des ${label}`;
  ariaLabelSortAsc = (label) => `Trier dans l'ordre croissant des ${label}`;

  sortBy = (column) => {
    if (this.sortTable.column !== column) {
      this.sortTable = { column: column, order: 'asc' };
      return;
    }

    if (this.sortTable.order === 'desc') {
      this.sortTable = {
        column: null,
        order: null,
      };
      return;
    }

    this.sortTable = { column: column, order: 'desc' };
  };

  getColumnSortOrder = (column) => {
    if (column === this.sortTable.column) return this.sortTable.order;
    return null;
  };

  get sortedBrokenUrls() {
    if (!this.sortTable.column) return this.args.brokenUrls;

    return this.args.brokenUrls.toSorted((a, b) => {
      const aColumn = a[this.sortTable.column].toString();
      const bColumn = b[this.sortTable.column].toString();
      const sortFunc = this.columnSortFunctions[this.sortTable.column];
      const sortResult = sortFunc(aColumn, bColumn);
      if (this.sortTable.order === 'asc') return sortResult;
      return -sortResult;
    });
  }

  <template>
    <section class="page-section broken-urls-list">
      <PixTable @caption="Liste des URLs cassées" @condensed={{true}} @data={{this.sortedBrokenUrls}} @variant="orga">
        <:columns as |brokenUrl context|>
          <PixTableColumn
            @context={{context}}
            class="column--wide"
            @onSort={{fn this.sortBy "url"}}
            @sortOrder={{this.getColumnSortOrder "url"}}
            @ariaLabelDefaultSort={{this.ariaLabelDefaultSort}}
            @ariaLabelSortDesc={{this.ariaLabelSortDesc}}
            @ariaLabelSortAsc={{this.ariaLabelSortAsc}}
          >
            <:header>URL</:header>
            <:cell>{{brokenUrl.url}}</:cell>
          </PixTableColumn>
          <PixTableColumn
            @context={{context}}
            class="column--wide"
            @onSort={{fn this.sortBy "statusCode"}}
            @sortOrder={{this.getColumnSortOrder "statusCode"}}
            @ariaLabelDefaultSort={{this.ariaLabelDefaultSort}}
            @ariaLabelSortDesc={{this.ariaLabelSortDesc}}
            @ariaLabelSortAsc={{this.ariaLabelSortAsc}}
          >
            <:header>Statut de l'erreur</:header>
            <:cell>{{brokenUrl.statusCode}}</:cell>
          </PixTableColumn>
          <PixTableColumn
            @context={{context}}
            class="column--wide"
            @onSort={{fn this.sortBy "errorMessage"}}
            @sortOrder={{this.getColumnSortOrder "errorMessage"}}
            @ariaLabelDefaultSort={{this.ariaLabelDefaultSort}}
            @ariaLabelSortDesc={{this.ariaLabelSortDesc}}
            @ariaLabelSortAsc={{this.ariaLabelSortAsc}}
          >
            <:header>Message d'erreur</:header>
            <:cell>{{brokenUrl.errorMessage}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Acquis</:header>
            <:cell>
              <div class="broken-urls-list__links">
                {{#each brokenUrl.skills as |skill|}}
                  <PixButtonLink @route="authenticated.skill" @model={{skill.id}} @size="small" @variant="tertiary">
                    {{skill.name}}
                  </PixButtonLink>
                {{/each}}
              </div>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Épreuves</:header>
            <:cell>
              <div class="broken-urls-list__links">
                {{#each brokenUrl.localizedChallenges as |challenge|}}
                  <PixButtonLink
                    @route="authenticated.challenge"
                    @model={{challenge.id}}
                    @size="small"
                    @variant="tertiary"
                  >
                    {{challenge.id}}
                  </PixButtonLink>
                {{/each}}
              </div>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    </section>
  </template>
}
