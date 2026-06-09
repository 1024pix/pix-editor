import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import * as monaco from 'monaco-editor';

export default class MonacoEditor extends Component {
  setup = modifier((element) => {
    const { value, ...options } = this.args.options;
    const editor = monaco.editor.create(element, options);
    // WORKAROUND: passing value in options does not fill textarea’s value
    if (value) editor.setValue(value);
    editor.onDidChangeModelContent(() => {
      this.args.onChange?.(editor.getValue());
    });
    return () => {
      editor.dispose();
    };
  });

  <template>
    <div {{this.setup}} ...attributes></div>
  </template>
}
