import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

export default class WhitelistedUrlsTable extends Component {
  formatCheckType(checkType) {
    if (checkType === 'exact_match') {
      return 'Strictement égale à';
    } else {
      return 'Commence par';
    }
  };

  checkTypeColor(checkType) {
    if (checkType === 'exact_match') {
      return 'primary';
    } else {
      return 'secondary';
    }
  };

  formatCreationString(whitelistedUrl) {
    const formatter = new DateFormatter(whitelistedUrl.createdAt);
    const DDMMYYYY = formatter.toDDMMYYYY();
    const HHMM = formatter.toHHMM();
    if (!whitelistedUrl.creatorName) {
      return `${DDMMYYYY} à ${HHMM}`;
    }
    return `${DDMMYYYY} à ${HHMM} par ${whitelistedUrl.creatorName} `;
  };

  formatUpdateString(whitelistedUrl) {
    const formatter = new DateFormatter(whitelistedUrl.updatedAt);
    const DDMMYYYY = formatter.toDDMMYYYY();
    const HHMM = formatter.toHHMM();
    if (!whitelistedUrl.latestUpdatorName) {
      return `${DDMMYYYY} à ${HHMM}`;
    }
    return `${DDMMYYYY} à ${HHMM} par ${whitelistedUrl.latestUpdatorName}`;
  };

  @action
  async copyUrl(whitelistedUrl) {
    const clipboard = this.args.clipboard ?? navigator.clipboard;
    await clipboard.writeText(whitelistedUrl.url);
  }

  <template>
    <div class="whitelisted-urls-table">
      <PixTable
        @caption="Liste des URLs à ne pas mettre dans les URLs cassées"
        @condensed={{true}}
        @data={{@whitelistedUrls}}
      >
        <:columns as |row context|>
          <PixTableColumn @context={{context}} class="column--small">
            <:header>
              Nom des acquis concernés
            </:header>
            <:cell>
              <LinkTo @route="authenticated.whitelisted-urls.whitelisted-url.edit" @model={{row.id}}>
                {{row.relatedSkillNames}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Type de comparaison
            </:header>
            <:cell>
              <LinkTo @route="authenticated.whitelisted-urls.whitelisted-url.edit" @model={{row.id}}>
                <PixTag class="whitelisted-url-check-type-tag" @color={{this.checkTypeColor row.checkType}}>
                  {{this.formatCheckType row.checkType}}
                </PixTag>
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>
              URL
            </:header>
            <:cell>
              <LinkTo @route="authenticated.whitelisted-urls.whitelisted-url.edit" @model={{row.id}}>
                {{row.url}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--wide">
            <:header>
              Commentaire
            </:header>
            <:cell>
              <LinkTo @route="authenticated.whitelisted-urls.whitelisted-url.edit" @model={{row.id}}>
                {{row.comment}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--small">
            <:header>
              Créée le
            </:header>
            <:cell>
              <LinkTo @route="authenticated.whitelisted-urls.whitelisted-url.edit" @model={{row.id}}>
                {{this.formatCreationString row}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--small">
            <:header>
              Modifiée le
            </:header>
            <:cell>
              <LinkTo @route="authenticated.whitelisted-urls.whitelisted-url.edit" @model={{row.id}}>
                {{this.formatUpdateString row}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="column--small">
            <:header>
              Actions
            </:header>
            <:cell>
              <div class="actions">
                <PixTooltip
                  @id='copy-whitelisted-url-link-tooltip'
                  @position="left"
                  @isInline={{true}}
                >
                  <:triggerElement>
                    <PixIconButton
                      @triggerAction={{fn this.copyUrl row}}
                      @iconName="copy"
                      @iconPrefix="far"
                      @ariaLabel="Copier l'URL whitelistée"
                      class="icon"
                      aria-describedby='copy-whitelisted-url-link-tooltip'
                    />
                  </:triggerElement>
                  <:tooltip>Copier l’URL whitelistée</:tooltip>
                </PixTooltip>
                <PixTooltip
                  @id='delete-whitelisted-url-tooltip'
                  @position="left"
                  @isInline={{true}}
                >
                  <:triggerElement>
                    <PixIconButton
                      @triggerAction={{fn this.args.onDeleteWhitelistedUrl row}}
                      @iconName="delete"
                      @ariaLabel="Supprimer l'URL de la whitelist"
                      class="icon"
                      aria-describedby='delete-whitelisted-url-tooltip'
                    />
                  </:triggerElement>
                  <:tooltip>Supprimer l'URL de la whitelist</:tooltip>
                </PixTooltip>
              </div>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    </div>
  </template>
}

class DateFormatter {
  constructor(date) {
    this.date = new Date(date);
  }

  toDDMMYYYY() {
    const formater = new Intl.DateTimeFormat('fr');
    return formater.format(this.date);
  }

  toHHMM() {
    const formater = new Intl.DateTimeFormat('fr', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return formater.format(this.date);
  }
}
