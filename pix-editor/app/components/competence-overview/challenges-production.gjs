import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'ember-dayjs/helpers/dayjs-format';
import flagForLanguage from 'pixeditor/helpers/flag-for-language';
import Challenge from 'pixeditor/models/challenge';

export default class ChallengesProduction extends Component {
  @service router;
  @service multipanelManager;

  @tracked shouldDisplayObsoleteChallenges = false;

  get challenges() {
    const excludeStatuses = [];
    if (!this.shouldDisplayObsoleteChallenges) {
      excludeStatuses.push(Challenge.STATUSES.PERIME);
    }
    return this.args.challenges
      .filter((challenge) => !excludeStatuses.includes(challenge.status))
      .sort(byAlternativeVersion);
  }

  getChallengeStatusColor(challengeStatus) {
    if (challengeStatus === Challenge.STATUSES.PROPOSE) {
      return 'tertiary';
    }
    if (challengeStatus === Challenge.STATUSES.VALIDE) {
      return 'success';
    }
    if (challengeStatus === Challenge.STATUSES.ARCHIVE) {
      return 'neutral';
    }
    if (challengeStatus === Challenge.STATUSES.PERIME) {
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

  @action
  toggleDisplayObsoleteChallenges() {
    this.shouldDisplayObsoleteChallenges = !this.shouldDisplayObsoleteChallenges;
  }

  @action
  closePanel() {
    this.multipanelManager.reset();
    this.router.transitionTo('authenticated.v2.competence-overview');
  }

  @action
  expandPanel() {
    this.multipanelManager.expandTable();
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
            @triggerAction={{this.expandPanel}}
            @ariaLabel="Agrandir la liste des épreuves"
            @iconName="openInFull"
          />
          <span class="separator"></span>
          <PixIconButton
            class="challenges-production-header__button-icon"
            @triggerAction={{this.closePanel}}
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
                  @triggerAction={{fn this.copyChallengePreviewUrl challenge}}
                />
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>
      </div>
    </section>
  </template>
}

function byAlternativeVersion(challengeA, challengeB) {
  if (challengeA.isPrototype) {
    return -1;
  }
  if (challengeB.isPrototype) {
    return 1;
  }
  return challengeA.alternativeVersion - challengeB.alternativeVersion;
}
