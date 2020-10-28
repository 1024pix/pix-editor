import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import MarkdownIt from 'markdown-it';

export default class Mde extends Component {

  get safeHelpContent() {
    return htmlSafe(this.args.helpContent);
  }

  get previewContent() {
    const markdown = new MarkdownIt({ html: true });
    const preview = markdown.render(this.args.value);
    return htmlSafe(preview);
  }

}
