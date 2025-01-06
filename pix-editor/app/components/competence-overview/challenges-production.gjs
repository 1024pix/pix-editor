import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import Component from '@glimmer/component';
import dayjs from 'ember-dayjs/helpers/dayjs-format';
import flagForLanguage from 'pixeditor/helpers/flag-for-language';
import Challenge from 'pixeditor/models/challenge';
import {on} from '@ember/modifier';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class ChallengesProduction extends Component {
  @tracked shouldDisplayObsoleteChallenges = false;

  get challenges() {
    const statuses = [Challenge.STATUSES.VALIDE];
    if(this.shouldDisplayObsoleteChallenges) {
      statuses.push(Challenge.STATUSES.PERIME);
    }
    return this.args.challenges.filter((challenge) => statuses.includes(challenge.status));
  }

  @action
  toggleDisplayObsoleteChallenges() {
    this.shouldDisplayObsoleteChallenges = !this.shouldDisplayObsoleteChallenges;
  }

  getChallengeStatusColor(challengeStatus) {
    if(challengeStatus === Challenge.STATUSES.VALIDE) {
      return 'success';
    }
    if(challengeStatus === Challenge.STATUSES.PERIME) {
      return 'error';
    }
    return 'secondary';
  }

  getChallengePreviewUrl(challenge) {
    return new URL(challenge.preview, window.location).href;
  }

  @action
  async copyChallengePreviewUrl(challenge) {
    await navigator.clipboard.writeText(this.getChallengePreviewUrl(challenge));
  }

<template>
    <section class="challenges-production">
      <header class="challenges-production__header">
        <p>
          {{@skill.name}}
          <PixTag @color="success">
            actif
          </PixTag>
          <span class="separator"></span>
          V{{@skill.version}}
        </p>
        <div class="challenges-production-header__action-buttons">
          <PixIconButton
            class="challenges-production-header__button-icon"
            @ariaLabel="Agrandir la liste des épreuves"
            @iconName="openInFull"
          />
          <span class="separator"></span>
          <PixIconButton
            class="challenges-production-header__button-icon"
            @ariaLabel="Fermer la liste des épreuves"
            @iconName="close"
          />
        </div>
      </header>
      <div class="challenges-production--table">
        <div class="display-actions">
          <PixCheckbox
            {{on "click" this.toggleDisplayObsoleteChallenges}}
            @checked={{this.shouldDisplayObsoleteChallenges}}
          >
            <:label>Afficher les épreuves périmées</:label>
          </PixCheckbox>
        </div>
        <PixTable @data={{this.challenges}}>
          <:columns as |challenge context|>
            <PixTableColumn @context={{context}}>
              <:header>
                Version
              </:header>
              <:cell>
                {{#if challenge.isPrototype}}
                  Proto
                {{else}}
                  {{challenge.alternativeVersion}}
                {{/if}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="consigne">
              <:header>
                Consigne
              </:header>
              <:cell>
                {{challenge.instruction}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Dernière MAJ
              </:header>
              <:cell>
                {{dayjs challenge.updatedAt "DD/MM/YYYY" allow-empty=true}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Auteur
              </:header>
              <:cell>
                {{challenge.author}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Statut
              </:header>
              <:cell>
                <PixTag @color={{this.getChallengeStatusColor challenge.status}}>
                  {{challenge.status}}
                </PixTag>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Locale
              </:header>
              <:cell>
                {{#each challenge.locales as |locale|}}
                  <p>
                    {{flagForLanguage locale}} {{locale}}
                  </p>
                {{/each}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Actions
              </:header>
              <:cell>
                <a
                  href="{{this.getChallengePreviewUrl challenge}}"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Prévisualiser l'épreuve {{challenge.id}}"
                >
                  <PixIcon @name="eye" />
                </a>
                <PixIconButton
                  @ariaLabel="Copier le lien de l'épreuve {{challenge.id}}"
                  @iconName="copy"
                  @triggerAction={{this.copyChallengePreviewUrl challenge}}
                />
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>
      </div>
    </section>
  </template>
}
