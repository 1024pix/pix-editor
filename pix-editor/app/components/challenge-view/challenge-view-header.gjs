import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'ember-dayjs/helpers/dayjs-format';
import flagForLanguage from 'pixeditor/helpers/flag-for-language';
import Challenge from 'pixeditor/models/challenge';

export default class ChallengesViewHeader extends Component {
  @service router;
  @service multipanelManager;

  @action
  closePanel() {
    this.multipanelManager.onDetailsClosed();
    this.router.transitionTo('authenticated.v2.competence-overview.challenges', this.args.competenceId, this.args.overview, this.args.skillId);
  }

  @action
  expandPanel() {
    this.multipanelManager.expandDetails();
  }

  @action
  async copyChallengePreviewUrl(challenge) {
    await navigator.clipboard.writeText(this.getChallengePreviewUrl(challenge));
  }

  getChallengePreviewUrl(challenge) {
    return new URL(challenge.preview, window.location).href;
  }

  buildStatusText(challenge) {
    const formater = new Intl.DateTimeFormat('fr');
    if (challenge.status === Challenge.STATUSES.VALIDE) {
      return `Validée${challenge.validatedAt ? ` le ${formater.format(challenge.validatedAt)}` : ''}`;
    }
    if (challenge.status === Challenge.STATUSES.ARCHIVE) {
      return `Archivée${challenge.archivedAt ? ` le ${formater.format(challenge.archivedAt)}` : ''}`;
    }
    if (challenge.status === Challenge.STATUSES.PERIME) {
      return `Périmée${challenge.madeObsoleteAt ? ` le ${formater.format(challenge.madeObsoleteAt)}` : ''}`;
    }
    return 'Proposée';
  }

  <template>
    <header class="challenge-view-header">
      <div class="challenge-view-header-first">
        <p>Épreuve {{@challenge.version}}</p>
        <div class="challenge-view-header__action-buttons">
          <PixIconButton
            class="challenge-view-header__button-icon"
            @triggerAction={{this.expandPanel}}
            @ariaLabel="Agrandir l'épreuve"
            @iconName="openInFull"
          />
          <span class="challenge-view-header__separator"></span>
          <PixIconButton
            class="challenge-view-header__button-icon"
            @triggerAction={{this.closePanel}}
            @ariaLabel="Fermer l'épreuve"
            @iconName="close"
          />
        </div>
      </div>
      <div class="challenge-view-header-second">
        <div class="challenge-view-header-second__locales">
          {{#each @challenge.locales as |locale|}}
            <p>
              {{flagForLanguage locale}} {{locale}}
            </p>
          {{/each}}
        </div>
        <div class="challenge-view-header-second__infos">
          <PixTag @color={{@statusColor}}>
            {{this.buildStatusText @challenge}}
          </PixTag>
          <p>{{dayjs @challenge.updatedAt "DD/MM/YYYY" allow-empty=true}}</p>
        </div>
        <span class="challenge-view-header__dark-separator"></span>
        <div class="challenge-view-header-second__actions">
          <PixTooltip
            @id='preview-challenge-tooltip'
            @position="top"
            @isInline={{true}}
            @isLight={{true}}
          >
            <:triggerElement>
              <a
                class="challenge-view-header-action__preview"
                href="{{this.getChallengePreviewUrl @challenge}}"
                target="_blank"
                rel="noopener noreferrer"
                aria-labelledby="preview-challenge-tooltip"
              >
                <PixIcon @name="eye" />
              </a>
            </:triggerElement>
            <:tooltip>Prévisualiser l'épreuve <span class="sr-only">{{@challenge.id}}</span></:tooltip>
          </PixTooltip>
          <PixTooltip
            @id='copy-url-challenge-tooltip'
            @position="top"
            @isInline={{true}}
            @isLight={{true}}
          >
            <:triggerElement>
              <PixIconButton
                aria-labelledby="copy-url-challenge-tooltip"
                @iconName="copy"
                @triggerAction={{fn this.copyChallengePreviewUrl @challenge}}
              />
            </:triggerElement>
            <:tooltip>Copier le lien de l'épreuve <span class="sr-only">{{@challenge.id}}</span></:tooltip>
          </PixTooltip>
        </div>
      </div>
    </header>
  </template>
}
