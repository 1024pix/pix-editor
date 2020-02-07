import classic from 'ember-classic-decorator';
import Component from '@ember/component';
import {action} from '@ember/object';

@classic
export default class CustomCheckbox extends Component {
  init() {
    super.init(...arguments);
    this.ignorableAttrs = ['checked', 'label', 'disabled'];
  }

  @action
  toggle() {
    this.set('checked', !this.get('checked'));
  }
}
