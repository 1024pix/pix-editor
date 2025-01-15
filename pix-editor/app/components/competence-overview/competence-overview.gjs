import PixButton from '@1024pix/pix-ui/components/pix-button';
import { concat, hash } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import CompetenceOverviewSkill from './competence-overview-skill';
import CompetenceOverviewHeader from './competence-overview-header';

export default class CompetenceOverview extends Component {
  @service router;
  @service multipanelManager;

  @action
  refresh() {
    this.router.refresh('authenticated.v2.competence-overview');
  }

  <template>
    <CompetenceOverviewHeader  @competenceOverview={{@competenceOverview}} />
    <div class="competence-overview">
      <div class="competence-overview-main {{if this.multipanelManager.gridShouldBeMinimized "competence-overview-main--hidden" ""}}">
        <div class="competence-overview-actions">
          <ul class="competence-overview-actions__tabs">
            <li class="active">En production</li>
            <li>
              <LinkTo @route="authenticated.competence.prototypes" @model={{@competenceOverview.airtableId}} @query={{hash view="workbench" languageFilter=@locale}}>
                Atelier
              </LinkTo>
            </li>
          </ul>
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
        <div class="competence-overview-grid">
        {{#each @competenceOverview.thematicOverviews as |thematicOverview|}}
          <div class="thematic" style={{concat "--tubes-count: " thematicOverview.tubeOverviews.length ";"}}>
            <h3>{{thematicOverview.name}}</h3>
            {{#each thematicOverview.tubeOverviews as |tubeOverview|}}
            <div class="tube">
              <h4>{{tubeOverview.name}}</h4>
              {{#each tubeOverview.skillOverviews as |skillOverview|}}
                <CompetenceOverviewSkill @skillOverview={{skillOverview}} class="skill" />
              {{/each}}
            </div>
            {{/each}}
          </div>
        {{/each}}
        </div>
        <div class="competence-overview-footer">
          {{#if this.hasLocaleSelected}}
            <ul class="competence-overview-legend">
              <li>
                <span class="circle green"></span> L'acquis possède des épreuves validées
              </li>
              <li>
                <span class="circle red"></span> L'acquis ne possède pas d’épreuve
              </li>
              <li>
                <span class="circle blue"></span> L'acquis possède seulement des épreuves proposées
              </li>
            </ul>
          {{/if}}
          <div class="competence-overview-counts">
            <p>Tubes : {{@competenceOverview.tubesCount}}</p>
            <p>Acquix : {{@competenceOverview.skillsCount}}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
}

