import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import flagForLanguage from 'pixeditor/helpers/flag-for-language';
import LocalizedChallenge from 'pixeditor/models/localized-challenge';

import DropdownMenu from '../dropdown-menu';

export default class LocalizedChallengeViewHeader extends Component {
  @service access;
  @service multipanelManager;
  @service router;

  @action
  closePanel() {
    this.multipanelManager.onDetailsClosed();

    this.router.transitionTo(
      'authenticated.v2.competence-overview.localized-challenges',
      this.args.competence.id,
      this.args.overview,
      this.args.skillId,
    );
  }

  @action
  expandPanel() {
    this.multipanelManager.expandDetails();
  }

  @action
  async copyLocalizedChallengePreviewUrl() {
    await navigator.clipboard.writeText(this.args.challengeLocale.localizedPreviewUrl);
  }

  @action
  async copyChallengePreviewUrl() {
    await navigator.clipboard.writeText(this.args.challengeLocale.challenge.previewUrl);
  }

  get localizedChallenge() {
    return this.args.challengeLocale.localizedChallengeValue;
  }

  get mayEditLocalized() {
    return this.access.mayEditLocalized;
  }

  get toggleLocalizedChallengeStatusButtonState() {
    if (this.localizedChallenge.status === LocalizedChallenge.STATUSES.PAUSE) {
      return { name: 'Mettre en prod', icon: 'playCircle' };
    }
    return { name: 'Mettre en pause', icon: 'pauseCircle' };
  }

  get mayChangeStatus() {
    return this.access.mayChangeLocalizedChallengeStatus(this.localizedChallenge);
  }

  <template>
    <header class="challenge-view-header">
      <div class="challenge-view-header-first">
        <p>
          {{#if @challengeLocale.isPrototype}}
            Proto
          {{else}}
            Déclinaison
            {{@challengeLocale.alternativeVersion}}
          {{/if}}
          (V{{@challengeLocale.version}})
        </p>
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
          {{flagForLanguage @challengeLocale.locale}}
        </div>
        <div class="challenge-view-header-second__infos">
          <PixTag @color={{@challengeLocale.localizedStatusColor}}>
            {{@challengeLocale.localizedStatusText}}
          </PixTag>
        </div>
        <span class="challenge-view-header__dark-separator"></span>
        <div class="challenge-view-header-second__actions">
          <PixTooltip
            @id="preview-challenge-tooltip"
            @position="top"
            @isInline={{true}}
            @isLight={{true}}
            class="preview-menu"
          >
            <:triggerElement>
              <DropdownMenu @ariaLabel="Ouvrir la liste des prévisualisations de l'épreuve" @iconName="eye">
                <ul>
                  <li class="preview-menu__item">
                    <a href={{@challengeLocale.localizedPreviewUrl}} target="_blank">
                      <PixIcon @name="eye" alt="" />
                      Prévisualiser l'épreuve traduite
                    </a>
                  </li>
                  <li class="preview-menu__item">
                    <a href={{@challengeLocale.challenge.previewUrl}} target="_blank">
                      <PixIcon @name="eye" alt="" />
                      Prévisualiser l'épreuve source
                    </a>
                  </li>
                </ul>
              </DropdownMenu>
            </:triggerElement>
            <:tooltip>Afficher la liste des previews
              <span class="sr-only">{{@challengeLocale.challenge.id}}</span></:tooltip>
          </PixTooltip>
          <PixTooltip
            @id="copy-url-challenge-tooltip"
            @position="top"
            @isInline={{true}}
            @isLight={{true}}
            class="preview-menu"
          >
            <:triggerElement>
              <DropdownMenu @ariaLabel="Ouvrir la liste des liens de prévisualisations d'épreuves" @iconName="copy">
                <ul>
                  <li class="preview-menu__item">
                    <button type="button" {{on "click" this.copyLocalizedChallengePreviewUrl}}>
                      <PixIcon @name="copy" alt="" />
                      Copier le lien de l'épreuve traduite
                    </button>
                  </li>
                  <li class="preview-menu__item">
                    <button type="button" {{on "click" this.copyChallengePreviewUrl}}>
                      <PixIcon @name="copy" alt="" />
                      Copier le lien de l'épreuve source
                    </button>
                  </li>
                </ul>
              </DropdownMenu>
            </:triggerElement>
            <:tooltip>Copier le lien de l'épreuve <span class="sr-only">{{this.localizedChallenge.id}}</span></:tooltip>
          </PixTooltip>
          {{#if @challengeLocale.translationsUrl}}
            <a
              class="phrase-link"
              href={{@challengeLocale.translationsUrl}}
              target="_blank"
              referrerpolicy="strict-origin"
              aria-label={{concat "traduction de l'épreuve de version " @challengeLocale.alternativeVersion}}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15.7046 0H5.35587C4.63273 0 6.50052 2.45604 6.50052 2.45604H15.7008C16.9204 2.45604 17.9096 3.4452 17.9115 4.6648V14.2398C17.9115 15.4594 16.9223 16.4486 15.7008 16.4486H13.7356C13.5558 16.4486 13.4078 16.5947 13.4078 16.7764V18.5768C13.4078 18.7585 13.5539 18.9046 13.7356 18.9046H15.7008C18.2768 18.9046 20.3656 16.8157 20.3656 14.2398V4.6648C20.3656 2.08885 18.2768 0 15.7008 0H15.7046Z"
                  fill="black"
                />
                <path
                  d="M10.0773 23.7251L5.02476 19.8471C4.37843 19.3525 4 18.5844 4 17.7714V1.31155C4 0.226846 5.24582 -0.387633 6.10759 0.273681L11.1602 4.15164C11.8065 4.6481 12.1849 5.41432 12.1849 6.22926V22.6891C12.1849 23.7738 10.9391 24.3882 10.0773 23.7269V23.7251Z"
                  fill="#03EAB3"
                />
              </svg>
            </a>
          {{/if}}
        </div>
        <div class="challenge-view-header-second__right-action">
          {{#if this.mayEditLocalized}}
            {{#if @edition}}
              <PixButton @triggerAction={{@cancelEdit}} @variant="secondary" aria-label="Annuler l'édition">
                Annuler
              </PixButton>
              <PixButton @triggerAction={{@openSaveConfirmPopin}}>
                Enregistrer
              </PixButton>
            {{else}}
              {{#if this.mayChangeStatus}}
                <PixButton
                  @triggerAction={{@openProductionStatusConfirmPopin}}
                  @iconBefore={{this.toggleLocalizedChallengeStatusButtonState.icon}}
                >
                  {{this.toggleLocalizedChallengeStatusButtonState.name}}
                </PixButton>
              {{/if}}
              <PixButton @triggerAction={{@edit}} @iconAfter="edit">
                Modifier
              </PixButton>
            {{/if}}
          {{/if}}
        </div>
      </div>
    </header>
  </template>
}
