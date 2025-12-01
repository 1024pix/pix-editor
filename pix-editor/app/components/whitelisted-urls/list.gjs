import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import RelatedSkillCell from 'pixeditor/components/whitelisted-urls/related-skill-cell';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { fn } from '@ember/helper';

export default class WhitelistedUrlList extends Component {
  <template>
    <PixFilterBanner
      @title="Filtres"
      class="table-filter-banner filter-whitelisted-url-form"
      @clearFiltersLabel="Réinitialiser les filtres"
      @onClearFilters={{this.clearFilters}}
      @isClearFilterButtonDisabled={{false}}
      @loadFiltersLabel="Filtrer"
      @onLoadFilters={{this.applyFilters}}
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
    </PixFilterBanner>
    <div class="whitelisted-urls-table">
      <PixTable
        @caption="Liste des URLs à ne pas mettre dans les URLs cassées"
        @condensed={{true}}
        @data={{@whitelistedUrls}}
        @variant="primary"
        @onRowClick={{@goToEditWhitelistedUrl}}
      >
        <:columns as |whitelistedUrl context|>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Nom des acquis concernés</:header>
            <:cell>
              <RelatedSkillCell @skills={{whitelistedUrl.relatedSkillNames}} />
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>Type de comparaison</:header>
            <:cell>
              <PixTag class="whitelisted-url-check-type-tag" @color={{this.checkTypeColor whitelistedUrl.checkType}}>
                {{this.formatCheckType whitelistedUrl.checkType}}
              </PixTag>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>URL</:header>
            <:cell>{{whitelistedUrl.url}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>Commentaire</:header>
            <:cell>{{whitelistedUrl.comment}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--small">
            <:header>Créée le</:header>
            <:cell>{{this.formatCreationString whitelistedUrl}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--small">
            <:header>Modifiée le</:header>
            <:cell>{{this.formatUpdateString whitelistedUrl}}</:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--small">
            <:header>Actions</:header>
            <:cell>
              <div class="actions">
                <PixTooltip @id="copy-whitelisted-url-link-tooltip" @position="left" @isInline={{true}}>
                  <:triggerElement>
                    <PixIconButton
                      @triggerAction={{fn this.copyUrl whitelistedUrl}}
                      @iconName="copy"
                      @iconPrefix="far"
                      @ariaLabel="Copier l'URL"
                      class="icon"
                      aria-describedby="copy-whitelisted-url-link-tooltip"
                    />
                  </:triggerElement>
                  <:tooltip>Copier l’URL</:tooltip>
                </PixTooltip>
                <PixTooltip @id="delete-whitelisted-url-tooltip" @position="left" @isInline={{true}}>
                  <:triggerElement>
                    <PixIconButton
                      @triggerAction={{fn this.deleteWhitelistedUrl whitelistedUrl}}
                      @iconName="delete"
                      @ariaLabel="Supprimer l'URL"
                      class="icon"
                      aria-describedby="delete-whitelisted-url-tooltip"
                    />
                  </:triggerElement>
                  <:tooltip>Supprimer l'URL</:tooltip>
                </PixTooltip>
              </div>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    </div>
  </template>

  @service router;
  @tracked searchUrl;
  @tracked searchNames;

  constructor(...args) {
    super(...args);
    this.searchUrl = this.args.urlFilterValue;
    this.searchNames = this.args.namesFilterValue;
  }

  formatCheckType = (checkType) => {
    if (checkType === 'exact_match') {
      return 'Strictement égale à';
    } else {
      return 'Commence par';
    }
  };

  checkTypeColor = (checkType) => {
    if (checkType === 'exact_match') {
      return 'primary';
    } else {
      return 'yellow';
    }
  };

  formatCreationString = (whitelistedUrl) => {
    const date = new Date(whitelistedUrl.createdAt);
    const DDMMYYYY = this.formatDateToDDMMYYY(date);
    const HHMM = this.formatDateToHHMM(date);
    if (!whitelistedUrl.creatorName) {
      return `${DDMMYYYY} à ${HHMM}`;
    }
    return `${DDMMYYYY} à ${HHMM} par ${whitelistedUrl.creatorName} `;
  };

  formatUpdateString = (whitelistedUrl) => {
    const date = new Date(whitelistedUrl.updatedAt);
    const DDMMYYYY = this.formatDateToDDMMYYY(date);
    const HHMM = this.formatDateToHHMM(date);
    if (!whitelistedUrl.latestUpdatorName) {
      return `${DDMMYYYY} à ${HHMM}`;
    }
    return `${DDMMYYYY} à ${HHMM} par ${whitelistedUrl.latestUpdatorName}`;
  };

  formatDateToDDMMYYY(date) {
    const formater = new Intl.DateTimeFormat('fr');
    return formater.format(date);
  }

  formatDateToHHMM(date) {
    const formater = new Intl.DateTimeFormat('fr', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return formater.format(date);
  }

  @action
  async copyUrl(whitelistedUrl, event) {
    event.stopPropagation();
    await navigator.clipboard.writeText(whitelistedUrl.url);
  }

  @action
  async deleteWhitelistedUrl(whitelistedUrl, event) {
    event.stopPropagation();
    await this.args.onDeleteItemClicked(whitelistedUrl);
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
}
