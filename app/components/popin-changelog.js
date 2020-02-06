import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Component from '@ember/component';

@classic
export default class PopinChangelog extends Component {
  value = "";

  @action
  confirm() {
    this.get("approve")(this.get("value"));
  }
}
