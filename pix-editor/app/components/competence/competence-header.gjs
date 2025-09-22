import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { LinkTo } from '@ember/routing';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CompetenceHeader extends Component {
  @service config;

  sections = [{
    label: 'Epreuves',
    value: 'challenges',
  }, {
    label: 'Acquis',
    value: 'skills',
  }, {
    label: 'Qualité',
    value: 'quality',
  },
  ];

  languageOptions = [
    {
      label: 'Anglais',
      value: 'en',
    },
    {
      label: 'Espagnol',
      value: 'es',
    },
    {
      label: 'Espagnol (Amérique latine)',
      value: 'es-419',
    },
    {
      label: 'Francophone',
      value: 'fr',
    },
    {
      label: 'Franco Français',
      value: 'fr-fr',
    },
    {
      label: 'Italie',
      value: 'it',
    },
    {
      label: 'Portugais',
      value: 'pt',
    },
    {
      label: 'Néerlandais',
      value: 'nl',
    },
  ];

  get liteClass() {
    return this.config.lite ? ' lite ' : '';
  }

  get selectedSection() {
    const section = this.args.section;
    return this.sections.find((el) => el.value === section);
  }

  get selectedLanguageToFilter() {
    const language = this.languageOptions.find((languagesOption) => languagesOption.value === this.args.languageFilter);
    return language?.value || null;
  }

  get displayLanguageFilter() {
    if (this.args.section === 'skills') {
      return this.args.view === 'production' || this.args.view === 'draft';
    }
    return this.args.section === 'challenges' && this.args.view === 'production';
  }

  <template>
    <section class="ui main-title{{this.liteClass}}">
      <h1 class="ui left floated header">
        <LinkTo @route="authenticated.competence-management.single" @model={{@competence}} class="competence-management-link">{{@competence.name}}</LinkTo>
      </h1>
      <div class="main-title-filters">
        {{#if this.displayLanguageFilter}}
          <PixSelect
            @className="competence-header__language-filter"
            @onChange={{@selectLanguageToFilter}}
            @options={{this.languageOptions}}
            @value={{this.selectedLanguageToFilter}}
            @placeholder="Filtre par langue"
          >
            <:default as |languageOption|>
              {{languageOption.label}}
            </:default>
          </PixSelect>
        {{/if}}
        <PixSelect
          @onChange={{@selectSection}}
          @options={{this.sections}}
          @value={{this.selectedSection.value}}
          @hideDefaultOption={{true}}
        >
          <:default as |section|>{{section.label}}</:default>
        </PixSelect>
      </div>
    </section>

  </template>
}
