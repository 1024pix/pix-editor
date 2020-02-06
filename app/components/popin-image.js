import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { classNames } from '@ember-decorators/component';
import Component from '@ember/component';

@classic
@classNames('small')
export default class PopinImage extends Component {
  @action
  closeModal() {
    this.set('display', false)
  }
}
