import classic from 'ember-classic-decorator';
import { classNames, classNameBindings } from '@ember-decorators/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

@classic
@classNames('ui', 'borderless', 'bottom', 'attached', 'labelled', 'icon', 'menu')
@classNameBindings('hiddenClass', 'skillClass')
export default class CompetenceFooter extends Component {
  @service
  config;

  @service
  access;

  @computed('hidden')
  get hiddenClass() {
    return this.get('hidden')?'hidden':'';
  }

  @computed('section')
  get skillClass() {
    return (this.get('section') === 'skills')?'skill-mode':'';
  }

  @computed('section', 'view')
  get displayWorkbenchViews() {
    const section = this.get('section');
    const view = this.get('view');
    return section === 'challenges' && view !== 'production';
  }

  @computed('section', 'view')
  get displayProductionStats() {
    const section = this.get('section');
    const view = this.get('view');
    return section === 'quality' || (section === 'challenges' && view === 'production');
  }

  @computed('section', 'config.access')
  get mayCreateTube() {
    return this.get('section') === 'skills' && this.get('access').mayCreateTube();
  }

  @computed('section', 'view', 'config.access')
  get mayCreateTemplate() {
    const section = this.get('section');
    const view = this.get('view');
    return section === 'challenges' && (view === 'workbench' || view === 'workbench-list') && this.get('access').mayCreateTemplate();
  }
}
