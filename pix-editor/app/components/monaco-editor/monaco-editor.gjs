import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import * as monaco from 'monaco-editor';

export default class MonacoEditor extends Component {
  setup = modifier((element) => {
    const editor = this.createEditor(element);
    const stopListeningForChanges = this.listenForChanges(editor);
    const stopHighlightingErrorLines = this.highlightErrorLines(editor);

    return () => {
      stopListeningForChanges();
      stopHighlightingErrorLines();
      editor.dispose();
    };
  });

  createEditor(element) {
    const { value, ...options } = this.args.options;
    const editor = monaco.editor.create(element, options);
    // WORKAROUND: passing value in options does not fill textarea’s value
    if (value) editor.setValue(value);
    return editor;
  }

  listenForChanges(editor) {
    const listener = editor.onDidChangeModelContent(() => {
      this.args.onChange?.(editor.getValue());
    });
    return () => listener.dispose();
  }

  highlightErrorLines(editor) {
    const decorations = editor.createDecorationsCollection();
    const model = editor.getModel();

    const listener = monaco.editor.onDidChangeMarkers((changedUris) => {
      // Since several MonacoEditor instances can exist at once, we must check the changed URIs contain OUR model's URI,
      // otherwise we would react to errors belonging to a different editor.
      const isThisEditorAffected = changedUris.some((uri) => uri.toString() === model.uri.toString());
      if (!isThisEditorAffected) return;

      decorations.set(this.getErrorLineDecorations(model));
    });
    return () => listener.dispose();
  }

  getErrorLineDecorations(model) {
    // Several errors can land on the same line: use Set() so we don't create overlapping decorations for that line.
    const errorLineNumbers = new Set(
      monaco.editor.getModelMarkers({ resource: model.uri }).map((marker) => marker.startLineNumber),
    );

    return [...errorLineNumbers].map((lineNumber) => ({
      range: new monaco.Range(lineNumber, 1, lineNumber, 1),
      // `isWholeLine: true` => to highlight the full error line.
      options: { isWholeLine: true, className: 'monaco-editor__error-line' },
    }));
  }

  <template>
    <div {{this.setup}} ...attributes></div>
  </template>
}
