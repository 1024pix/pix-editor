import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class Mde extends Component {

  simpleMDEOptions = {
    status:false,
    spellChecker:false,
    hideIcons: ['heading', 'image', 'guide', 'side-by-side']
  };

  get safeHelpContent() {
    return htmlSafe(this.args.helpContent);
  }

}
