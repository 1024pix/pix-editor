import classic from 'ember-classic-decorator';
import { classNames, classNameBindings } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

@classic
@classNames('ui', 'main-title')
@classNameBindings('liteClass')
export default class CompetenceHeader extends Component {
  @service
  config;

  @computed('config.lite')
  get liteClass() {
    const lite = this.get('config.lite');
    return lite ? 'lite' : '';
  }

  @computed('section')
  get selectedSection() {
    const section = this.get('section');
    const selectedItem = this.get('sections').filter(el=>el.id === section);
    return selectedItem[0];
  }

  init() {
    super.init(...arguments);
    this.sections = [{
      title: 'Epreuves',
      id: 'challenges'
    }, {
      title: 'Acquis',
      id: 'skills'
    }, {
      title: 'Qualité',
      id: 'quality'
    }];
  }

  @action
  selectView(view) {
    this.get('selectSection')(view);
  }
}
