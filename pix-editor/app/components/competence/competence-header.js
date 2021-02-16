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
    id: false,
    title: 'Filtre par langue'
  },{
    id: 'Francophone'
  }, {
    id: 'Franco Français'
  }, {
    id: 'Anglais'
  }, {
    id: 'Espagnol'
  }, {
    id: 'Italie'
  }, {
    id: 'Allemand'
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
    return this.languageOptions.find(languagesOption => languagesOption.id === languageFilter);
  }

  get isProductionViewAndSkillsOrChallengesSection() {
    return this.args.view === 'production' && (this.args.section === 'skills' || this.args.section === 'challenges');
  }
}
