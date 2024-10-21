import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CompetenceHeader extends Component {
  @service config;

  sections = [{
    title: 'Epreuves',
    id: 'challenges',
  }, {
    title: 'Acquis',
    id: 'skills',
  }, {
    title: 'Qualité',
    id: 'quality',
  },
  ];

  languageOptions = [{
    locale: undefined,
    title: 'Filtre par langue',
  }, {
    language: 'Anglais',
    locale: 'en',
  }, {
    language: 'Espagnol',
    locale: 'es',
  }, {
    language: 'Francophone',
    locale: 'fr',
  }, {
    language: 'Franco Français',
    locale: 'fr-fr',
  }, {
    language: 'Italie',
    locale: 'it',
  }, {
    language: 'Portugais',
    locale: 'pt',
  }, {
    language: 'Néerlandais',
    locale: 'nl',
  }];

  get liteClass() {
    return this.config.lite ? ' lite ' : '';
  }

  get selectedSection() {
    const section = this.args.section;
    return this.sections.find((el) => el.id === section);
  }

  get selectedLanguageToFilter() {
    const languageFilter = this.args.languageFilter;
    return this.languageOptions.find((languagesOption) => languagesOption.locale === languageFilter);
  }

  get displayLanguageFilter() {
    if (this.args.section === 'skills') {
      return this.args.view === 'production' || this.args.view === 'draft';
    }
    return this.args.section === 'challenges' && this.args.view === 'production';
  }
}
