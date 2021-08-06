import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CompetenceHeader extends Component {
  @service config;

  sections = [{
    title: 'Epreuves',
    id: 'challenges'
  }, {
    title: 'Acquis',
    id: 'skills'
  }, {
    title: 'Qualité',
    id: 'quality'
  }, {
    title: 'International',
    id: 'i18n'
  }];

  languageOptions = [{
    local: false,
    title: 'Filtre par langue'
  }, {
    language: 'Anglais',
    local: 'en',
  }, {
    language: 'Espagnol',
    local: 'es',
  }, {
    language: 'Francophone',
    local: 'fr',
  }, {
    language: 'Franco Français',
    local: 'fr-fr'
  }, {
    language: 'Italie',
    local: 'it',
  }, {
    language: 'Portugais',
    local: 'pt',
  }];

  get liteClass() {
    return this.config.lite ? ' lite ' : '';
  }

  get selectedSection() {
    const section = this.args.section;
    return this.sections.find(el => el.id === section);
  }

  get selectedLanguageToFilter() {
    const languageFilter = this.args.languageFilter;
    return this.languageOptions.find(languagesOption => languagesOption.local === languageFilter);
  }

  get isProductionViewAndSkillsOrChallengesSection() {
    return this.args.view === 'production' && (this.args.section === 'skills' || this.args.section === 'challenges');
  }
}
