import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Select from 'pixeditor/components/field/select';

const sections = [
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
const languageOptions = [
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

// TRADUCTIONS PIXSELECT
const selectTranslationList = {
  placeholder: 'Filtre par langue',
  searchPlaceholder: 'Rechercher une langue',
  emptySearchMessage: 'Aucune langue correspondante',
};

export default class CompetenceHeader extends Component {
  @service config;
  @tracked languageOptionsResult = languageOptions;

  get liteClass() {
    return this.config.lite ? ' lite ' : '';
  }

  get selectedSection() {
    const section = this.args.section;
    return sections.find((el) => el.value === section);
  }

  get selectedLanguageToFilter() {
    const language = languageOptions.find((languagesOption) => languagesOption.value === this.args.languageFilter);
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
      this.languageOptionsResult = languageOptions;
      return;
    }
    this.languageOptionsResult = languageOptions.filter(({ label }) =>
      label.toLowerCase().includes(filter.trim().toLowerCase()),
    );
  }

  <template>
    <section class="ui main-title{{this.liteClass}}">
      <h1 class="ui left floated header">
        <LinkTo
          @route="authenticated.competence-management.single"
          @model={{@competence}}
          class="competence-management-link"
        >{{@competence.name}}</LinkTo>
      </h1>
      <div class="main-title-filters">
        {{#if this.displayLanguageFilter}}
          <Select
            @className="competence-header__language-filter"
            @onChange={{@selectLanguageToFilter}}
            @options={{this.languageOptionsResult}}
            @value={{this.selectedLanguageToFilter}}
            @isSearchable={{true}}
            @screenReaderOnly={{true}}
            @onSearch={{this.updateLanguageOptions}}
            @texts={{selectTranslationList}}
          >
            <:label>{{selectTranslationList.placeholder}}</:label>
          </Select>
        {{/if}}
        <Select
          @onChange={{@selectSection}}
          @options={{sections}}
          @value={{this.selectedSection.value}}
          @screenReaderOnly={{true}}
          @hideDefaultOption={{true}}
        >
          <:label>Changer de vue Epreuves/Acquis/Qualité</:label>
        </Select>
      </div>
    </section>
  </template>
}
