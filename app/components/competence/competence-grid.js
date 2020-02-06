import classic from 'ember-classic-decorator';
import { classNames, classNameBindings } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';

@classic
@classNames('competence-grid')
@classNameBindings('hiddenClass')
export default class CompetenceGrid extends Component {
  @computed('hidden')
  get hiddenClass() {
    return this.get('hidden')?'hidden':'';
  }

  @computed('section', 'view')
  get displayAllTubes() {
    return this.get('section') === 'skills' || this.get('view') === 'workbench';
  }
}
