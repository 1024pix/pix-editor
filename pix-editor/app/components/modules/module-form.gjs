import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixLabel from '@1024pix/pix-ui/components/pix-label';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import * as monaco from 'monaco-editor';
import MonacoEditor from 'pixeditor/components/monaco-editor/monaco-editor';

const MODULE_SCHEMA_URI = 'https://api.integration.pix.fr/api/module-schema/module-json-schema.json';

let schemaPromise;
function getModuleSchema() {
  if (!schemaPromise) {
    schemaPromise = fetch(MODULE_SCHEMA_URI).then((response) => response.json());
  }
  return schemaPromise;
}

export default class ModuleForm extends Component {
  @service intl;

  @tracked internalTitle;
  @tracked moduleData;

  constructor(...args) {
    super(...args);

    this.loadModuleSchema();

    this.monacoOptions = {
      ariaLabel: this.intl.t('modules.components.module-form.content-label'),
      ariaRequired: true,
      automaticLayout: true,
      domReadOnly: this.args.readonly,
      language: 'json',
      readOnly: this.args.readonly,
      theme: 'vs-light',
    };

    if (!this.args.module) return;

    const { id, internalTitle, shortId, slug, title, isBeta, visibility, details, sections, glossary } =
      this.args.module;

    this.internalTitle = internalTitle;
    this.moduleData = { id, shortId, slug, title, isBeta, visibility, details, sections, glossary };
    this.monacoOptions.value = JSON.stringify(this.moduleData, null, 2);
  }

  async loadModuleSchema() {
    const schema = await getModuleSchema();

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [{ uri: MODULE_SCHEMA_URI, fileMatch: ['*'], schema }],
    });
  }

  @action
  onChange(moduleJson) {
    try {
      this.moduleData = JSON.parse(moduleJson);
    } catch {
      this.moduleData = undefined;
    }
  }

  @action
  onMarkersChange(editorErrors) {
    this.args.onEditorErrorsChange?.(editorErrors);
  }

  get isSaveDisabled() {
    return !this.internalTitle || !this.moduleData;
  }

  @action onInternalTitleChange(event) {
    this.internalTitle = event.target.value;
  }

  @action async saveModule() {
    return this.args.saveModule({ ...this.moduleData, internalTitle: this.internalTitle });
  }

  back() {
    window.history.back();
  }

  get isIdsChangedWarningDisplayed() {
    if (!this.moduleData || !this.args.module) return false;
    return this.moduleData.id !== this.args.module.id || this.moduleData.shortId !== this.args.module.shortId;
  }

  <template>
    <div class="module-form">
      {{#if this.isIdsChangedWarningDisplayed}}
        <PixNotificationAlert @type="warning">
          {{t "modules.components.module-form.ids-warning-prefix"}}
          <code>id</code>
          {{t "modules.components.module-form.ids-warning-middle"}}
          <code>shortId</code>
          {{t "modules.components.module-form.ids-warning-suffix"}}
        </PixNotificationAlert>
      {{/if}}

      {{#unless @readonly}}
        <PixInput
          @id="internalTitle"
          @value={{this.internalTitle}}
          @requiredLabel={{t "modules.components.module-form.required-field"}}
          {{on "change" this.onInternalTitleChange}}
        >
          <:label>{{t "modules.components.module-form.internal-title-label"}}</:label>
        </PixInput>
      {{/unless}}

      <div class="module__data-field">
        <PixLabel @requiredLabel={{t "modules.components.module-form.required-field"}}>
          {{t "modules.components.module-form.content-label"}}
        </PixLabel>
        <MonacoEditor
          @options={{this.monacoOptions}}
          class="module-form__monaco-editor"
          @onChange={{this.onChange}}
          @onMarkersChange={{this.onMarkersChange}}
        />
      </div>

      {{#unless @readonly}}
        <div class="module-form__actions">
          <PixButton @triggerAction={{this.saveModule}} @isDisabled={{this.isSaveDisabled}}>
            {{t "modules.components.module-form.save"}}
          </PixButton>
          <PixButton @triggerAction={{this.back}} @variant="secondary">
            {{t "modules.components.module-form.cancel"}}
          </PixButton>
        </div>
      {{/unless}}
    </div>
  </template>
}
