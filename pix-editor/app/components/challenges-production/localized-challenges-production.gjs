import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'ember-dayjs/helpers/dayjs-format';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallenge from 'pixeditor/models/localized-challenge';

import ChallengesProductionHeader from './challenges-production-header';

const PRIMARY_IN_LOCALE_STATUS = 'PRIMARY_IN_LOCALE';
const NOT_TRANSLATED_STATUS = 'NOT_TRANSLATED';

// todo list
/*
menu actions
lien vers phrase
 */
export default class LocalizedChallengesProduction extends Component {
  @service router;
  @tracked shouldDisplayObsoleteChallenges = false;

  get sortedChallenges() {
    const excludeStatuses = [];
    if (!this.shouldDisplayObsoleteChallenges) {
      excludeStatuses.push(Challenge.STATUSES.PERIME);
    }
    return this.args.challenges
      .filter((challenge) => !excludeStatuses.includes(challenge.status))
      .sort(byAlternativeVersion);
  }

  get localizedChallengeDataItems() {
    return this.sortedChallenges.map((challenge) => {
      const localizedChallengeForLocale = this.args.localizedChallenges.find((localizedChallenge) =>
        localizedChallenge.challenge.id === challenge.id && localizedChallenge.locale === this.args.locale);
      const isPrimaryInLocale = challenge.locales.includes(this.args.locale);
      const localizedStatus = isPrimaryInLocale ? PRIMARY_IN_LOCALE_STATUS
        : localizedChallengeForLocale ? localizedChallengeForLocale.status : NOT_TRANSLATED_STATUS;
      return {
        version: challenge.isPrototype ? 'Proto' : challenge.alternativeVersion,
        instruction: localizedChallengeForLocale?.instruction ?? challenge.instruction,
        primaryUpdatedAt: challenge.updatedAt,
        primaryAuthor: challenge.author,
        primaryStatusColor: this.getPrimaryStatusColor(challenge.status),
        primaryStatusText: this.getPrimaryStatusText(challenge.status),
        localizedStatusColor: this.getLocalizedStatusColor(localizedStatus),
        localizedStatusText: this.getLocalizedStatusText(localizedStatus),
      };
    });
  }

  getPrimaryStatusColor(primaryStatus) {
    if (primaryStatus === Challenge.STATUSES.PROPOSE) {
      return 'tertiary';
    }
    if (primaryStatus === Challenge.STATUSES.VALIDE) {
      return 'success';
    }
    if (primaryStatus === Challenge.STATUSES.ARCHIVE) {
      return 'neutral';
    }
    if (primaryStatus === Challenge.STATUSES.PERIME) {
      return 'error';
    }
    return 'secondary';
  }

  getPrimaryStatusText(primaryStatus) {
    return primaryStatus ?? 'absence de statut ❓';
  }

  getLocalizedStatusColor(localizedStatus) {
    if (localizedStatus === LocalizedChallenge.STATUSES.PLAY) {
      return 'success';
    }
    if (localizedStatus === LocalizedChallenge.STATUSES.PAUSE) {
      return 'secondary';
    }
    if (localizedStatus === PRIMARY_IN_LOCALE_STATUS) {
      return 'neutral';
    }
    if (localizedStatus === NOT_TRANSLATED_STATUS) {
      return 'tertiary';
    }
    return 'error';
  }

  getLocalizedStatusText(localizedStatus) {
    if (localizedStatus === LocalizedChallenge.STATUSES.PLAY) {
      return 'En prod';
    }
    if (localizedStatus === LocalizedChallenge.STATUSES.PAUSE) {
      return 'En pause';
    }
    if (localizedStatus === PRIMARY_IN_LOCALE_STATUS) {
      return 'Source dans la langue';
    }
    if (localizedStatus === NOT_TRANSLATED_STATUS) {
      return 'Pas traduit';
    }
    return 'absence de statut ❓';
  }

  @action
  toggleDisplayObsoleteChallenges() {
    this.shouldDisplayObsoleteChallenges = !this.shouldDisplayObsoleteChallenges;
  }

<template>
    <ChallengesProductionHeader @skill={{@skill}} />
    <section class="challenges-production">
      <div class="challenges-production-table">
        <PixTable @condensed={{true}} @data={{this.localizedChallengeDataItems}} @caption={{concat "Tableau des épreuves de l'acquis " @skill.name}}>
          <:columns as |localizedChallengeData context|>
            <PixTableColumn @context={{context}}>
              <:header>
                Version
              </:header>
              <:cell>
                {{localizedChallengeData.version}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="challenges-production-table__consigne">
              <:header>
                Consigne
              </:header>
              <:cell>
                <div class="challenges-production-table__consigne">
                  {{localizedChallengeData.instruction}}
                </div>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Dernière MAJ
              </:header>
              <:cell>
                {{dayjs localizedChallengeData.primaryUpdatedAt "DD/MM/YYYY" allow-empty=true}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Auteur
              </:header>
              <:cell>
                {{localizedChallengeData.primaryAuthor}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Source
              </:header>
              <:cell>
                <PixTag @color={{localizedChallengeData.primaryStatusColor}}>
                  {{localizedChallengeData.primaryStatusText}}
                </PixTag>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Traduction
              </:header>
              <:cell>
                <PixTag @color={{localizedChallengeData.localizedStatusColor}}>
                  {{localizedChallengeData.localizedStatusText}}
                </PixTag>
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
