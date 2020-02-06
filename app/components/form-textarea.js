import classic from 'ember-classic-decorator';
import { classNames, classNameBindings } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import Component from '@ember/component';
import { htmlSafe } from '@ember/template';

@classic
@classNames('field', 'textArea')
@classNameBindings('maximized')
export default class FormTextarea extends Component {
  maximized = false;

  @computed('helpContent')
  get safeHelpContent() {
    return htmlSafe(this.get('helpContent'));
  }

  @action
  toggleMaximized() {
    this.set('maximized', !this.get('maximized'));
  }
}
