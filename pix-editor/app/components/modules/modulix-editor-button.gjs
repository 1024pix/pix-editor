import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import ENV from 'pixeditor/config/environment';

export default class ModulixEditorButton extends Component {
  @tracked previewWindow;

  constructor(...args) {
    super(...args);
    this.addModuleContentListener();
  }

  @action
  addModuleContentListener() {
    window.addEventListener('message', (event) => {
      if (event.data?.from === 'modulix-editor' && event.data?.message === 'ready') {
        const moduleContent = this.args.moduleContent;
        if (moduleContent) {
          this.previewWindow?.postMessage({ from: 'pix-editor', moduleContent }, '*');
        }
      }
    });
  }

  @action
  onModulixEditorButtonClicked() {
    const windowName = 'modulix-editor-edit';
    this.previewWindow = window.open(ENV.APP.MODULIX_EDITOR_URL, windowName);
  }

  <template>
    <PixButton @variant="secondary" @iconAfter="openNew" @triggerAction={{this.onModulixEditorButtonClicked}}>
      {{t "modules.modulix-editor-button.label"}}
    </PixButton>
  </template>
}
