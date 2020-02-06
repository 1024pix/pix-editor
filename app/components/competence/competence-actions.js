import classic from 'ember-classic-decorator';
import { classNames, classNameBindings } from '@ember-decorators/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

@classic
@classNames('ui', 'top', 'attached', 'borderless', 'labelled', 'icon', 'menu')
@classNameBindings('hiddenClass', 'skillCkass')
export default class CompetenceActions extends Component {
  @service
  config;

  @computed('hidden')
  get hiddenClass() {
    return this.get('hidden')?'hidden':'';
  }

  @computed('view')
  get skillClass() {
    return (this.get('view')==='skills')?'skill-mode':'';
  }
}
