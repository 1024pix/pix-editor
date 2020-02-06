import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { htmlSafe } from '@ember/template';

@classic
@classNames('field')
export default class FormMde extends Component {
  @computed('helpContent')
  get safeHelpContent() {
    return htmlSafe(this.get('helpContent'));
  }

  init() {
    super.init(...arguments);
    this.simpleMDEOptions = {
      status:false,
      spellChecker:false,
      hideIcons: ["heading", "image", "guide", "side-by-side"]
    };
  }
}
