import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CompetenceHeader extends Component {
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

  languageOptions = [
    {
      label: 'Allemand (Autriche)',
      value: 'de-AT',
    },
    {
      label: 'Anglais',
      value: 'en',
    },
    {
      label: 'Anglais (Ouganda)',
      value: 'en-UG',
    },
    {
      label: 'Anglais (Rwanda)',
      value: 'en-RW',
    },
    {
      label: 'Anglais (Tanzanie)',
      value: 'en-TZ',
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
      label: 'Franco Belge',
      value: 'fr-BE',
    },
    {
      label: 'Italien',
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

  @tracked languageOptionsResult = this.languageOptions;

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

  @action
  updateLanguageOptions(filter) {
    if (!filter.trim()) {
      this.languageOptionsResult = this.languageOptions;
      return;
    }
    this.languageOptionsResult = this.languageOptions.filter(({ label }) =>
      label.toLowerCase().includes(filter.trim().toLowerCase()),
    );
  }

  <template>
    <section class="main-title">
      <h1 class="main-title__heading">
        <LinkTo
          @route="authenticated.competence-management.single"
          @model={{@competence}}
          class="competence-management-link"
        >{{@competence.name}}</LinkTo>
      </h1>
      <div class="main-title-filters">
        {{#if this.displayLanguageFilter}}
          <PixSelect
            @className="competence-header__language-filter"
            @onChange={{@selectLanguageToFilter}}
            @options={{this.languageOptionsResult}}
            @value={{this.selectedLanguageToFilter}}
            @placeholder="Filtre par langue"
            @isSearchable={{true}}
            @onSearch={{this.updateLanguageOptions}}
            @searchPlaceholder="Rechercher une langue"
            @emptySearchMessage="Aucune langue correspondante"
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
