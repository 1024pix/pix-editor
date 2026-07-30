import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import EasyMDE from 'easymde';
import { modifier } from 'ember-modifier';

const toolbar = [
  'preview',
  'side-by-side',
  'fullscreen',
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
  <template>
    <textarea {{this.easyMDESetup}} ...attributes>{{@value}}</textarea>
  </template>

  @tracked easyMDE;

  easyMDESetup = modifier((element) => {
    this.easyMDE = new EasyMDE({
      element,
      sideBySideFullscreen: false,
      spellChecker: false,
      nativeSpellcheck: false,
      status: false,
      previewClass: 'mde-preview',
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
