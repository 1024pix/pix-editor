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

    const decorations = editor.createDecorationsCollection();
    const model = editor.getModel();
    const markersListener = monaco.editor.onDidChangeMarkers((uris) => {
      if (!uris.some((uri) => uri.toString() === model.uri.toString())) return;

      const markers = monaco.editor.getModelMarkers({ resource: model.uri });
      const errorLines = new Set(markers.map((marker) => marker.startLineNumber));
      decorations.set(
        [...errorLines].map((lineNumber) => ({
          range: new monaco.Range(lineNumber, 1, lineNumber, 1),
          options: { isWholeLine: true, className: 'monaco-editor__error-line' },
        })),
      );

      this.args.onMarkersChange?.(markers.map((marker) => ({ line: marker.startLineNumber, message: marker.message })));
    });

    return () => {
      markersListener.dispose();
      editor.dispose();
    };
  });

  <template>
    <div {{this.setup}} ...attributes></div>
  </template>
}
