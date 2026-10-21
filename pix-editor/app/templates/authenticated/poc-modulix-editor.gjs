import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import MonacoEditor from 'pixeditor/components/monaco-editor/monaco-editor';
import SchemaForm from 'pixeditor/components/schema-form';

const EMPTY_MODULE = {
  id: '',
  shortId: '',
  slug: '',
  title: '',
  isBeta: false,
  visibility: 'private',
  details: {
    image: '',
    description: '',
    duration: 0,
    level: 'novice',
    objectives: [],
    tabletSupport: 'comfortable',
  },
  sections: [],
  glossary: [],
};

class PocModulixEditorPage extends Component {
  @tracked moduleValue = structuredClone(EMPTY_MODULE);

  get monacoOptions() {
    return {
      automaticLayout: true,
      language: 'json',
      theme: 'vs-light',
      value: JSON.stringify(this.moduleValue, null, 2),
    };
  }

  @action
  handleChange(newValue) {
    this.moduleValue = newValue;
  }

  @action
  resetModule() {
    this.moduleValue = structuredClone(EMPTY_MODULE);
  }

  @action
  importJson(jsonString) {
    try {
      this.moduleValue = JSON.parse(jsonString);
    } catch {
      // JSON invalide : on ne met pas à jour (pas de perte de données)
    }
  }

  <template>
    <div class='poc-modulix-editor'>
      <header class='poc-modulix-editor__header'>
        <h1 class='poc-modulix-editor__title'>PoC — Modulix Editor (SchemaForm)</h1>
        <p class='poc-modulix-editor__subtitle'>
          Formulaire piloté par le JSON schema de l'API · remplaçant de json-editor
        </p>
        <button type='button' class='poc-modulix-editor__reset' {{on 'click' this.resetModule}}>
          Réinitialiser
        </button>
      </header>

      <div class='poc-modulix-editor__body'>
        <section class='poc-modulix-editor__form-panel'>
          <h2 class='poc-modulix-editor__panel-title'>Formulaire</h2>
          <SchemaForm
            @schema={{@model.schema}}
            @value={{this.moduleValue}}
            @onChange={{this.handleChange}}
          />
        </section>

        <section class='poc-modulix-editor__json-panel'>
          <h2 class='poc-modulix-editor__panel-title'>JSON</h2>
          <MonacoEditor
            @options={{this.monacoOptions}}
            @onChange={{this.importJson}}
            class='poc-modulix-editor__monaco'
          />
        </section>
      </div>
    </div>
  </template>
}

export default class PocModulixEditorRoute extends Component {
  <template>
    <PocModulixEditorPage @model={{@model}} />
  </template>
}
