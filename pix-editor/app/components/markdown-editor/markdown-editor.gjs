import { Textarea } from '@ember/component';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';
import { on } from '@ember/modifier';
import EasyMDE from 'easymde';

const toolbar = [
  'preview',
  'side-by-side',
  '|',
  'heading',
  'bold',
  'italic',
  'strikethrough',
  '|',
  'horizontal-rule',
  'quote',
  '|',
  'unordered-list',
  'ordered-list',
  '|',
  'table',
  'upload-image',
  'link',
  '|',
  'code',
];

export default class MarkdownEditor extends Component {
  <template><Textarea {{this.easyMDESetup}} @value={{@value}} /></template>

  @tracked easyMDE;

  easyMDESetup = modifier((element) => {
    this.easyMDE = new EasyMDE({
      element,
      sideBySideFullscreen: false,
      spellChecker: false,
      nativeSpellcheck: false,
      status: false,
      toolbar,
    });
    this.easyMDE.codemirror.on('change', () => {
      this.args.onChange(this.easyMDE.value());
    });
    return () => {
      this.easyMDE?.cleanup();
      this.easyMDE = null;
    };
  });
}
