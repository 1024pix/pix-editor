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

  get liteClass() {
    return this.config.lite ? ' lite ' : '';
  }

  get selectedSection() {
    const section = this.args.section;
    return this.sections.find(el => el.id === section);
  }
}
