import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTag from '@1024pix/pix-ui/components/pix-tag';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { fn } from '@ember/helper';
import dayjs from 'ember-dayjs/helpers/dayjs-format';
import Component from '@glimmer/component';

import flagForLanguage from 'pixeditor/helpers/flag-for-language';

export default class ChallengesViewHeader extends Component {
  @service router;
  @service multipanelManager;

  @action
  closePanel() {
    this.multipanelManager.reset();
    this.router.transitionTo('authenticated.v2.competence-overview');
  }

  @action
  expandPanel() {
    this.multipanelManager.expandTable();
  }

  @action
  async copyChallengePreviewUrl(challenge) {
    await navigator.clipboard.writeText(this.getChallengePreviewUrl(challenge));
  }

  getChallengePreviewUrl(challenge) {
    return new URL(challenge.preview, window.location).href;
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

            {{@challenge.status}}
          </PixTag>
          <p>{{dayjs @challenge.updatedAt "DD/MM/YYYY" allow-empty=true}}</p>
        </div>
        <span class="challenge-view-header__dark-separator"></span>
        <div class="challenge-view-header-second__actions">
          <a
            href="{{this.getChallengePreviewUrl @challenge}}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Prévisualiser l'épreuve {{@challenge.id}}"
          >
            <PixIcon @name="eye" />
          </a>
          <PixIconButton
            @ariaLabel="Copier le lien de l'épreuve {{@challenge.id}}"
            @iconName="copy"
            @triggerAction={{fn this.copyChallengePreviewUrl @challenge}}
          />
        </div>
      </div>

    </header>
  </template>
}
