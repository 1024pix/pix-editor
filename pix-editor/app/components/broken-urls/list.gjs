import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixSearchInput from '@1024pix/pix-ui/components/pix-search-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class BrokenUrlList extends Component {
  @tracked sortTable = {
    column: 'url',
    order: 'asc',
  };

  get filteredBrokenUrls() {
    const urlFilter = this.args.urlFilterValue ?? '';
    const statusCodeFilter = this.args.statusCodeFilterValue ?? '';
    const skillFilters = this.args.skillFilterValues ?? [];
    const localizedChallengeFilters = this.args.localizedChallengeFilterValues ?? [];

    return this.args.brokenUrls.filter((brokenUrl) => {
      const hasUrlFilter = brokenUrl.url.includes(urlFilter);
      const hasStatusCodeFilter = brokenUrl.statusCode.toString().includes(statusCodeFilter);

      const skills = brokenUrl.hasMany('skills').value() ?? [];
      const hasSkillFilter = skillFilters.length === 0 || skills.some((skill) => skillFilters.includes(skill.id));

      const localizedChallenges = brokenUrl.hasMany('localizedChallenges').value() ?? [];
      const hasLocalizedChallengeFilter =
        localizedChallengeFilters.length === 0 ||
        localizedChallenges.some((challenge) => localizedChallengeFilters.includes(challenge.id));

      return hasUrlFilter && hasStatusCodeFilter && hasSkillFilter && hasLocalizedChallengeFilter;
    });
  }

  get statusCodeOptionList() {
    const statusCodes = new Set(this.args.brokenUrls.map((brokenUrl) => brokenUrl.statusCode.toString()));
    return Array.from(statusCodes)
      .sort((a, b) => a - b)
      .map((statusCode) => ({ label: statusCode, value: statusCode }));
  }

  get skillOptionList() {
    const skillsById = new Map();
    for (const brokenUrl of this.args.brokenUrls) {
      const skills = brokenUrl.hasMany('skills').value() ?? [];
      for (const skill of skills) {
        skillsById.set(skill.id, skill.name);
      }
    }
    return Array.from(skillsById, ([value, label]) => ({ value, label }));
  }

  get localizedChallengeOptionList() {
    const ids = new Set();
    for (const brokenUrl of this.args.brokenUrls) {
      for (const challenge of brokenUrl.hasMany('localizedChallenges').value() ?? []) {
        ids.add(challenge.id);
      }
    }
    return Array.from(ids, (id) => ({ label: id, value: id }));
  }

  columnSortFunctions = {
    url: (a, b) => a.localeCompare(b),
    statusCode: (a, b) => a - b,
    errorMessage: (a, b) => a.localeCompare(b),
  };

  get sortedBrokenUrls() {
    if (!this.sortTable.column) return this.filteredBrokenUrls;

    return this.filteredBrokenUrls.toSorted((a, b) => {
      const aColumn = a[this.sortTable.column].toString();
      const bColumn = b[this.sortTable.column].toString();
      const sortFunc = this.columnSortFunctions[this.sortTable.column];
      const sortResult = sortFunc(aColumn, bColumn);
      return this.sortTable.order === 'asc' ? sortResult : -sortResult;
    });
  }

  ariaLabelDefaultSort = 'Rétablir le tri par défaut';
  ariaLabelSortDesc = (label) => `Trier dans l'ordre décroissant des ${label}`;
  ariaLabelSortAsc = (label) => `Trier dans l'ordre croissant des ${label}`;

  sortBy = (column) => {
    if (this.sortTable.column !== column) {
      this.sortTable = { column, order: 'asc' };
      return;
    }
    if (this.sortTable.order === 'desc') {
      this.sortTable = { column: null, order: null };
      return;
    }
    this.sortTable = { column, order: 'desc' };
  };

  getColumnSortOrder = (column) => {
    return column === this.sortTable.column ? this.sortTable.order : null;
  };

  @action
  clearFilters() {
    this.args.onClearFiltersClicked();
  }

  @action
  triggerUrlFilter(_id, url) {
    return this.args.onApplyFiltersClicked('url', url);
  }

  @action
  triggerStatusCodeFilter(statusCode) {
    return this.args.onApplyFiltersClicked('statusCode', statusCode);
  }

  @action
  triggerSkillFilter(skills) {
    return this.args.onApplyFiltersClicked('skills', skills);
  }

  @action
  triggerLocalizedChallengeFilter(localizedChallenges) {
    return this.args.onApplyFiltersClicked('localizedChallenges', localizedChallenges);
  }

  <template>
    <section class="page-section broken-urls-list">
      <PixFilterBanner
        @clearFiltersLabel="Réinitialiser les filtres"
        @onClearFilters={{this.clearFilters}}
        @isClearFilterButtonDisabled={{false}}
      >
        <PixSearchInput
          @id="url-filter"
          @placeholder="Entrer une URL"
          @debounceTimeInMs="0"
          @triggerFiltering={{this.triggerUrlFilter}}
          @screenReaderOnly={{true}}
        >
          <:label>URL à remplir</:label>
        </PixSearchInput>
        <PixSelect
          @id="status-filter"
          @options={{this.statusCodeOptionList}}
          @value={{@statusCodeFilterValue}}
          @placeholder="Filtrer par statut d'erreur"
          @onChange={{this.triggerStatusCodeFilter}}
          @screenReaderOnly={{true}}
        />
        <PixMultiSelect
          @id="skill-filter"
          @options={{this.skillOptionList}}
          @values={{@skillFilterValues}}
          @onChange={{this.triggerSkillFilter}}
          @screenReaderOnly={{true}}
          @placeholder="Filtrer par acquis"
        >
          <:label>Acquis</:label>
          <:default as |option|>{{option.label}}</:default>
        </PixMultiSelect>
        <PixMultiSelect
          @id="localized-challenges-filter"
          @options={{this.localizedChallengeOptionList}}
          @values={{@localizedChallengeFilterValues}}
          @onChange={{this.triggerLocalizedChallengeFilter}}
          @screenReaderOnly={{true}}
          @placeholder="Filtrer par épreuve"
        >
          <:label>Épreuve</:label>
          <:default as |option|>{{option.label}}</:default>
        </PixMultiSelect>
      </PixFilterBanner>

      <PixTable @caption="Liste des URLs cassées" @condensed={{true}} @data={{this.sortedBrokenUrls}} @variant="orga">
        <:columns as |brokenUrl context|>
          <PixTableColumn
            @context={{context}}
            class="column--wide"
            @onSort={{fn this.sortBy "url"}}
            @sortOrder={{this.getColumnSortOrder "url"}}
            @ariaLabelDefaultSort={{this.ariaLabelDefaultSort}}
            @ariaLabelSortDesc={{this.ariaLabelSortDesc "url"}}
            @ariaLabelSortAsc={{this.ariaLabelSortAsc "url"}}
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
            @ariaLabelSortDesc={{this.ariaLabelSortDesc "statuts d'erreur"}}
            @ariaLabelSortAsc={{this.ariaLabelSortAsc "statuts d'erreur"}}
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
            @ariaLabelSortDesc={{this.ariaLabelSortDesc "messages d'erreur"}}
            @ariaLabelSortAsc={{this.ariaLabelSortAsc "messages d'erreur"}}
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
