import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Component from '@ember/component';

@classic
export default class PopinSingleEntry extends Component {
  @action
  validate() {
   this.set('display', false);
    this.get('setValue')(this.get('value'));
  }

  @action
  closeModal() {
    this.set('display', false);
  }
}
