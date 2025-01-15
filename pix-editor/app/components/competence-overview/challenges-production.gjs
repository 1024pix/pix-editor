import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'ember-dayjs/helpers/dayjs-format';
import flagForLanguage from 'pixeditor/helpers/flag-for-language';
import Challenge from 'pixeditor/models/challenge';

import ChallengesProductionHeader from './challenges-production-header';

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

  getChallengeStatus(challengeStatus) {
    return challengeStatus ?? 'absence de statut ❓';
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

<template>
    <ChallengesProductionHeader @skill={{@skill}} />
    <section class="challenges-production {{if this.multipanelManager.tableShouldBeExpanded "challenges-production--full" ""}}">
      <div class="challenges-production-table">
        <PixTable @data={{this.challenges}} @caption={{concat "Tableau des épreuves de l'acquis " @skill.name}} @condensed={{true}}>
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
            <PixTableColumn @context={{context}} class="challenges-production-table__consigne">
              <:header>
                Consigne
              </:header>
              <:cell>
                <div class="challenges-production-table__consigne">
                  {{challenge.instruction}}
                </div>
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
                  {{this.getChallengeStatus challenge.status}}
                </PixTag>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Locale
              </:header>
              <:cell>
                {{#each challenge.locales as |locale|}}
                  <div class="challenges-production-table__locale">
                    {{flagForLanguage locale}} {{locale}}
                  </div>
                {{/each}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="challenges-production-table__actions">
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
        <div class="challenges-production-table__display-actions">
          <PixCheckbox
            {{on "click" this.toggleDisplayObsoleteChallenges}}
            @checked={{this.shouldDisplayObsoleteChallenges}}
          >
            <:label>Afficher les épreuves périmées</:label>
          </PixCheckbox>
        </div>
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
