import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@classNames('field')
export default class Illustration extends Component {
  @action
  remove() {
    this.set('value', []);
  }

  @action
  add(file) {
    this.set('value', [{file:file}]);
  }
}
