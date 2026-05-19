import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixLabel from '@1024pix/pix-ui/components/pix-label';
import MonacoEditor from 'pixeditor/components/monaco-editor/monaco-editor';

export default class ModuleForm extends Component {
  @tracked moduleData;

  @action
  onChange(moduleJson) {
    try {
      this.moduleData = JSON.parse(moduleJson);
    } catch {
      this.moduleData = undefined;
    }
  }

  get monacoOptions() {
    return {
      ariaLabel: 'Contenu (JSON)',
      ariaRequired: true,
      automaticLayout: true,
      language: 'json',
      theme: 'vs-light',
    };
  }

  get title() {
    return this.moduleData?.title;
  }

  get isSaveDisabled() {
    return !this.moduleData;
  }

  @action
  async saveModule() {
    return this.args.saveModule(this.moduleData);
  }

  <template>
    <div class="module-form">
      <PixInput @id="title" @value={{this.title}} readonly>
        <:label>Titre</:label>
      </PixInput>

      <div class="module-form__data-field">
        <PixLabel @requiredLabel="Champ obligatoire">
          Contenu (JSON)
        </PixLabel>
        <MonacoEditor @options={{this.monacoOptions}} class="module-form__monaco-editor" @onChange={{this.onChange}} />
      </div>

      <div class="module-form__actions">
        <PixButton @triggerAction={{this.saveModule}} @isDisabled={{this.isSaveDisabled}}>
          Enregistrer
        </PixButton>
        <PixButtonLink @route="authenticated.modules" @variant="secondary">
          Annuler
        </PixButtonLink>
      </div>
    </div>
  </template>
}
