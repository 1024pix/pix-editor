import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
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
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallenge from 'pixeditor/models/localized-challenge';

import DropdownMenu from '../dropdown-menu';
import ChallengesProductionHeader from './challenges-production-header';

const PRIMARY_IN_LOCALE_STATUS = 'PRIMARY_IN_LOCALE';
const NOT_TRANSLATED_STATUS = 'NOT_TRANSLATED';

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
      .filter((challenge) => challenge.locales.includes(this.args.locale) || challenge.locales.includes('fr'))
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
        translationsUrl: this.getTranslationsUrl({ isPrimaryInLocale, challenge }),
        primaryStatusColor: this.getPrimaryStatusColor(challenge.status),
        primaryStatusText: this.getPrimaryStatusText(challenge.status),
        localizedStatusColor: this.getLocalizedStatusColor(localizedStatus),
        localizedStatusText: this.getLocalizedStatusText(localizedStatus),
        primaryPreviewUrl: new URL(challenge.preview, window.location).href,
        localizedPreviewUrl: localizedChallengeForLocale ? new URL(`${challenge.preview}?locale=${localizedChallengeForLocale.locale}`, window.location).href : null,
        primaryId: challenge.id,
        localizedId: localizedChallengeForLocale?.id,
        isNotTranslated: !isPrimaryInLocale && localizedChallengeForLocale,
      };
    });
  }

  getTranslationsUrl({ isPrimaryInLocale, challenge }) {
    if (this.args.locale === 'fr-fr') return null;
    if (isPrimaryInLocale) return null;
    return `/api/challenges/${challenge.id}/translations/${this.args.locale}/area-code/${this.args.areaCode}`;
  }

  getPrimaryStatusColor(primaryStatus) {
    if (primaryStatus === Challenge.STATUSES.PROPOSE) {
      return 'blue';
    }
    if (primaryStatus === Challenge.STATUSES.VALIDE) {
      return 'green';
    }
    if (primaryStatus === Challenge.STATUSES.ARCHIVE) {
      return 'grey';
    }
    if (primaryStatus === Challenge.STATUSES.PERIME) {
      return 'red';
    }
    return 'yellow';
  }

  getPrimaryStatusText(primaryStatus) {
    return primaryStatus ?? 'absence de statut ❓';
  }

  getLocalizedStatusColor(localizedStatus) {
    if (localizedStatus === LocalizedChallenge.STATUSES.PLAY) {
      return 'green';
    }
    if (localizedStatus === LocalizedChallenge.STATUSES.PAUSE) {
      return 'yellow';
    }
    if (localizedStatus === PRIMARY_IN_LOCALE_STATUS) {
      return 'grey';
    }
    if (localizedStatus === NOT_TRANSLATED_STATUS) {
      return 'blue';
    }
    return 'orange';
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

  @action
  async copyChallengePreviewUrl(previewUrl) {
    await navigator.clipboard.writeText(previewUrl);
  }

<template>
    <ChallengesProductionHeader @skill={{@skill}} @overview={{@overview}} @competenceId={{@competenceId}} @canExpand={{@canExpand}} />
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
            <PixTableColumn @context={{context}} class="challenges-production__localized-menu-action">
              <:cell>
                <DropdownMenu
                  @ariaLabel={{concat 'ouvrir option pour l\'épreuve ' localizedChallengeData.primaryId}}
                  @iconName="moreVert"
                  class="localized-menu-action"
                >
                  <li>
                    <span class="title">Source</span>
                    <ul aria-label="source">
                      <li class="localized-menu-action__item">
                        <a
                          href="{{localizedChallengeData.primaryPreviewUrl}}"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <PixIcon @name="eye" aria-hidden="true"/> Prévisualiser <span class="sr-only">l'épreuve {{localizedChallengeData.primaryId}}</span>
                        </a>
                      </li>
                    </ul>
                  </li>
                  {{#if localizedChallengeData.isNotTranslated}}
                    <li>
                      <span class="title">Traduction</span>
                      <ul aria-label="traduction">
                        <li class="localized-menu-action__item">
                          <a
                            href="{{localizedChallengeData.localizedPreviewUrl}}"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <PixIcon @name="eye" aria-hidden="true"/> Prévisualiser <span class="sr-only">l'épreuve {{localizedChallengeData.localizedId}}</span>
                          </a>
                        </li>
                        <li class="localized-menu-action__item">
                          <button
                            {{on 'click' (fn this.copyChallengePreviewUrl localizedChallengeData.localizedPreviewUrl)}}
                          >
                            <PixIcon @name="copy" aria-hidden="true"/> Copier le lien <span class="sr-only">de l'épreuve {{localizedChallengeData.localizedId}}</span>
                          </button>
                        </li>
                      </ul>
                    </li>
                  {{/if}}
                </DropdownMenu>
                {{#if localizedChallengeData.translationsUrl}}
                  <a class="ui button item" href={{localizedChallengeData.translationsUrl}} target="_blank" rel="noopener noreferrer" aria-label={{concat "traduction de l'épreuve de version " localizedChallengeData.version}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M15.7046 0H5.35587C4.63273 0 6.50052 2.45604 6.50052 2.45604H15.7008C16.9204 2.45604 17.9096 3.4452 17.9115 4.6648V14.2398C17.9115 15.4594 16.9223 16.4486 15.7008 16.4486H13.7356C13.5558 16.4486 13.4078 16.5947 13.4078 16.7764V18.5768C13.4078 18.7585 13.5539 18.9046 13.7356 18.9046H15.7008C18.2768 18.9046 20.3656 16.8157 20.3656 14.2398V4.6648C20.3656 2.08885 18.2768 0 15.7008 0H15.7046Z" fill="black"/>
                      <path d="M10.0773 23.7251L5.02476 19.8471C4.37843 19.3525 4 18.5844 4 17.7714V1.31155C4 0.226846 5.24582 -0.387633 6.10759 0.273681L11.1602 4.15164C11.8065 4.6481 12.1849 5.41432 12.1849 6.22926V22.6891C12.1849 23.7738 10.9391 24.3882 10.0773 23.7269V23.7251Z" fill="#03EAB3"/>
                    </svg>
                  </a>
                {{/if}}
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
