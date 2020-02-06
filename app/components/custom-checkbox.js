import classic from 'ember-classic-decorator';
import Component from '@ember/component';

@classic
export default class CustomCheckbox extends Component {
  name = null;
  label = null;
  disabled = false;

  init() {
    super.init(...arguments);
    this.ignorableAttrs = ['checked', 'label', 'disabled'];
  }
}
