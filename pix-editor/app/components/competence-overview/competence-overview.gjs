import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { concat, hash } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { eq } from 'ember-truth-helpers';
import { htmlSafe } from '@ember/template';

import CompetenceOverviewSkill from './competence-overview-skill';

export default class CompetenceOverview extends Component {
  @service access;
  @service phrase;
  @service router;
  @service notifications;
  @service multipanelManager;

  @tracked selectedSkillId = null;

  get mayEditLocalizedFramework() {
    return this.access.mayEditLocalized;
  }

  @action
  async fetchTranslations() {
    try {
      await this.phrase.download();
      this.notifications.sendSuccess('Téléchargement des traductions depuis Phrase effectué.');
      await this.refresh();
    } catch {
      this.notifications.sendError('Erreur lors du téléchargement des traductions.');
    }
  }

  @action
  async refresh() {
    this.router.transitionTo('authenticated.v2.competence-overview');
    await this.router.refresh('authenticated.v2.competence-overview');
  }

  @action
  async updateSelectedSkillId(id) {
    this.selectedSkillId = id;
  }

  thematicStyle(thematicOverview) {
    return htmlSafe(`--tubes-count: ${thematicOverview.tubeOverviews.length};`);
  }

  <template>
    <div
      class="competence-overview {{if this.multipanelManager.gridShouldBeMinimized 'competence-overview--hidden' ''}}"
    >
      <div class="competence-overview-actions">
        <ul class="competence-overview-actions__tabs">
          <li class="active">En production</li>
          <li>
            <LinkTo
              @route="authenticated.competence.prototypes"
              @model={{@competenceOverview.airtableId}}
              @query={{hash view="workbench" languageFilter=@locale}}
            >
              Atelier
            </LinkTo>
          </li>
        </ul>
        <div class="competence-overview-actions__buttons">
          {{#if @locale}}
            {{#if this.mayEditLocalizedFramework}}
              <PixButtonLink
                class="competence-overview-actions__fetch"
                @route="authenticated.v2.localized-framework"
                @variant="secondary"
              >Cadre de traduction</PixButtonLink>
            {{/if}}
            <PixButton
              class="competence-overview-actions__fetch"
              @size="small"
              @isBorderVisible={{true}}
              @variant="secondary"
              @loadingColor="grey"
              @triggerAction={{this.fetchTranslations}}
            >
              Récupérer les traductions
            </PixButton>
          {{/if}}
          <PixButton
            class="competence-overview-actions__refresh"
            @iconBefore="refresh"
            @size="small"
            @isBorderVisible={{true}}
            @variant="secondary"
            @triggerAction={{this.refresh}}
          >
            Actualiser
          </PixButton>
        </div>
      </div>
      <div class="competence-overview-grid">
        {{#each @competenceOverview.thematicOverviews as |thematicOverview|}}
          <div class="thematic" style={{this.thematicStyle thematicOverview}}>
            <h3>{{thematicOverview.name}}</h3>
            {{#each thematicOverview.tubeOverviews as |tubeOverview|}}
              <div class="tube">
                <h4>{{tubeOverview.name}}</h4>
                {{#each tubeOverview.skillOverviews as |skillOverview|}}
                  <CompetenceOverviewSkill
                    @skillOverview={{skillOverview}}
                    @locale={{@locale}}
                    class="skill"
                    @onSkillClicked={{this.updateSelectedSkillId}}
                    @isActive={{eq skillOverview.id this.selectedSkillId}}
                  />
                {{/each}}
              </div>
            {{/each}}
          </div>
        {{/each}}
      </div>
      <div class="competence-overview-footer">
        {{#if @locale}}
          <ul class="competence-overview-legend">
            <li>
              <span class="circle green"></span>
              L'acquis possède des épreuves validées
            </li>
            <li>
              <span class="circle red"></span>
              L'acquis ne possède pas d’épreuve
            </li>
            <li>
              <span class="circle blue"></span>
              L'acquis possède seulement des épreuves proposées
            </li>
          </ul>
        {{/if}}
        <div class="competence-overview-counts">
          <p>Tubes : {{@competenceOverview.tubesCount}}</p>
          <p>Acquix : {{@competenceOverview.skillsCount}}</p>
        </div>
      </div>
    </div>
  </template>
}
