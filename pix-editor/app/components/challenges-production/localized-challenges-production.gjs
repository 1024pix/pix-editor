import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { array, concat, fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import formatDate from 'ember-intl/helpers/format-date';
import Challenge from 'pixeditor/models/challenge';
import DropdownMenu from '../dropdown-menu';
import ChallengesProductionHeader from './challenges-production-header';

export default class LocalizedChallengesProduction extends Component {
  @service router;
  @service multipanelManager;

  @tracked shouldDisplayObsoleteChallenges = false;

  get challengeLocales() {
    const excludeStatuses = [];
    if (!this.shouldDisplayObsoleteChallenges) {
      excludeStatuses.push(Challenge.STATUSES.PERIME);
    }

    return this.args.challengeLocales.filter(
      (challengeLocale) => !excludeStatuses.includes(challengeLocale.primaryStatus),
    );
  }

  get isToRephrase() {
    return this.args.skill.productionPrototype.toRephrase;
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
    <ChallengesProductionHeader
      @skill={{@skill}}
      @overview={{@overview}}
      @competenceId={{@competence.id}}
      @canExpand={{@canExpand}}
      @isToRephrase={{this.isToRephrase}}
      @locale={{@locale}}
    />
    <section
      class="challenges-production
        {{if this.multipanelManager.tableShouldBeMinimized 'challenges-production--hidden' ''}}"
    >
      <div class="challenges-production-table">
        <PixTable
          @condensed={{true}}
          @data={{this.challengeLocales}}
          @caption={{concat "Tableau des épreuves de l'acquis " @skill.name}}
        >
          <:columns as |challengeLocale context|>
            <PixTableColumn @context={{context}}>
              <:header>
                Version
              </:header>
              <:cell>
                <LinkTo
                  @route="authenticated.v2.localized-challenge"
                  @models={{array @overview @skill.id challengeLocale.localizedChallengeId}}
                >
                  {{#if challengeLocale.isPrototype}}
                    Proto
                  {{else}}
                    {{challengeLocale.alternativeVersion}}
                  {{/if}}
                </LinkTo>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="challenges-production-table__consigne">
              <:header>
                Consigne
              </:header>
              <:cell>
                {{#if challengeLocale.isPrimaryInLocale}}
                  <LinkTo
                    @route="authenticated.v2.challenge"
                    @models={{array @overview @skill.id challengeLocale.challenge.id}}
                    @query={{hash locale=undefined}}
                  >
                    <div class="challenges-production-table__consigne">
                      {{challengeLocale.instruction}}
                    </div>
                  </LinkTo>
                {{else if challengeLocale.localizedChallengeValue}}
                  <LinkTo
                    @route="authenticated.v2.localized-challenge"
                    @models={{array @overview @skill.id challengeLocale.localizedChallengeId}}
                  >
                    <div class="challenges-production-table__consigne">
                      {{challengeLocale.instruction}}
                    </div>
                  </LinkTo>
                {{else}}
                  <div class="challenges-production-table__consigne">
                    {{challengeLocale.instruction}}
                  </div>
                {{/if}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Dernière MAJ
              </:header>
              <:cell>
                {{formatDate challengeLocale.primaryUpdatedAt "DD/MM/YYYY" allow-empty=true}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Auteur
              </:header>
              <:cell>
                {{challengeLocale.primaryAuthor}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Source
              </:header>
              <:cell>
                <PixTag @color={{challengeLocale.primaryStatusColor}}>
                  {{challengeLocale.primaryStatusText}}
                </PixTag>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                Traduction
              </:header>
              <:cell>
                <PixTag @color={{challengeLocale.localizedStatusColor}}>
                  {{challengeLocale.localizedStatusText}}
                </PixTag>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="challenges-production__localized-menu-action">
              <:cell>
                <DropdownMenu
                  @ariaLabel={{concat "ouvrir option pour l'épreuve " challengeLocale.challenge.id}}
                  @iconName="moreVert"
                  class="localized-menu-action"
                >
                  <li>
                    <span class="title">Source</span>
                    <ul aria-label="source">
                      <li class="localized-menu-action__item">
                        <a href="{{challengeLocale.primaryPreviewUrl}}" target="_blank">
                          <PixIcon @name="eye" aria-hidden="true" />
                          Prévisualiser
                          <span class="sr-only">l'épreuve {{challengeLocale.challenge.id}}</span>
                        </a>
                      </li>
                    </ul>
                  </li>
                  {{#if challengeLocale.isTranslated}}
                    <li>
                      <span class="title">Traduction</span>
                      <ul aria-label="traduction">
                        <li class="localized-menu-action__item">
                          <a href="{{challengeLocale.localizedPreviewUrl}}" target="_blank">
                            <PixIcon @name="eye" aria-hidden="true" />
                            Prévisualiser
                            <span class="sr-only">l'épreuve {{challengeLocale.localizedChallenge.id}}</span>
                          </a>
                        </li>
                        <li class="localized-menu-action__item">
                          <button
                            type="button"
                            {{on "click" (fn this.copyChallengePreviewUrl challengeLocale.localizedPreviewUrl)}}
                          >
                            <PixIcon @name="copy" aria-hidden="true" />
                            Copier le lien
                            <span class="sr-only">de l'épreuve {{challengeLocale.localizedChallenge.id}}</span>
                          </button>
                        </li>
                      </ul>
                    </li>
                  {{/if}}
                </DropdownMenu>
                {{#if challengeLocale.translationsUrl}}
                  <a
                    class="ui button item"
                    href={{challengeLocale.translationsUrl}}
                    target="_blank"
                    referrerpolicy="strict-origin"
                    aria-label={{concat "traduction de l'épreuve de version " challengeLocale.alternativeVersion}}
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
