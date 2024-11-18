import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { concat, hash } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import CompetenceOverviewSkill from './competence-overview-skill';

export default class CompetenceOverview extends Component {
  @service router;

  @action
  setLocale(locale) {
    if (locale === 'source') locale = undefined;
    this.router.transitionTo({
      queryParams: {
        locale,
      },
    });
  }

  @action
  setSection(section) {
    if (section === 'skills') {
      this.router.transitionTo('authenticated.competence.skills',
        this.args.competenceOverview.airtableId,
        {
          queryParams: {
            view: 'production',
            languageFilter: this.args.locale,
          },
        });
    }
    if (section === 'quality') {
      this.router.transitionTo('authenticated.competence.quality', this.args.competenceOverview.airtableId);
    }
  }

  @action
  refresh() {
    this.router.refresh('authenticated.v2.competence-overview');
  }

  localeOptions = [
    {
      label: 'Langue source',
      value: 'source',
      flag: '',
    },
    {
      label: 'Français',
      value: 'fr',
      flag: '🇫🇷',
    },
    {
      label: 'Anglais',
      value: 'en',
      flag: '🇬🇧',
    },
    {
      label: 'Espagnol',
      value: 'es',
      flag: '🇪🇸',
    },
    {
      label: 'Néerlandais',
      value: 'nl',
      flag: '🇳🇱',
    },
  ];

  sections = [
    {
      label: 'Epreuves',
      value: 'challenges',
    },
    {
      label: 'Acquis',
      value: 'skills',
    },
    {
      label: 'Qualité',
      value: 'quality',
    },
  ];

  get localeValue() {
    if (!this.args.locale) return 'source';
    return this.args.locale;
  }

  get localeEntry() {
    return this.localeOptions.find((localeEntry) => localeEntry.value === this.localeValue);
  }

  get hasLocaleSelected() {
    return !!this.args.locale;
  }

  <template>
    <div class="competence-overview">
      <div class="competence-overview-header">
        {{#if this.hasLocaleSelected}}
          <p class="locale-tag">
            <span>{{this.localeEntry.flag}}</span> {{this.localeEntry.label}}
          </p>
        {{/if}}
        <h2>
          <LinkTo @route="authenticated.competence-management.single" @model={{@competenceOverview.airtableId}}>{{@competenceOverview.name}}</LinkTo>
        </h2>
        <div class="competence-overview-header__spacer"></div>
        <PixSelect
          @options={{this.localeOptions}}
          @value={{this.localeValue}}
          @onChange={{this.setLocale}}
          @hideDefaultOption={{true}}
        />
        <PixSelect
          @options={{this.sections}}
          @value="challenges"
          @onChange={{this.setSection}}
          @hideDefaultOption={{true}}
        />
      </div>
      <div class="competence-overview-main">
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

