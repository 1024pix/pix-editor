import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import DraftModuleDiff from 'pixeditor/components/modules/draft-module-diff';
import ModuleForm from 'pixeditor/components/modules/module-form';
import ModuleNotification from 'pixeditor/components/modules/module-notification';
import PlayModuleButtons from 'pixeditor/components/modules/play-module-buttons';
import PublishModuleButton from 'pixeditor/components/modules/publish-module-button';
import ModuleValidationErrors from 'pixeditor/components/modules/validation-errors';

export default class DraftModule extends Component {
  @service intl;

  get hasValidationErrors() {
    return !this.args.model.draftModule.hasBeenValidated && this.validationErrors?.length > 0;
  }

  get validationErrors() {
    return this.args.model.draftModule.validationErrors;
  }

  get validationStatus() {
    return this.args.model.draftModule.hasBeenValidated;
  }

  get validationStatusInformation() {
    return this.validationStatus
      ? { label: this.intl.t('modules.draft-module.validation-success'), color: 'green', state: 'success' }
      : { label: this.intl.t('modules.draft-module.validation-failure'), color: 'error', state: 'failure' };
  }

  get links() {
    return [
      {
        route: 'authenticated.modules.workbench',
        label: this.intl.t('modules.breadcrumb.workbench.label'),
      },
      {
        label: this.intl.t('modules.breadcrumb.draft-module.label'),
      },
    ];
  }

  <template>
    <header class="module__header">
      <div>
        <PixBreadcrumb class="module-header__breadcrumb" @links={{this.links}} />

        <div class="draft-module-header__information">
          <h1 class="module-header__title">{{@model.draftModule.internalTitle}}</h1>
          <PixTag @color={{this.validationStatusInformation.color}}>
            <span class="draft-module-header__tag--{{this.validationStatusInformation.state}}">&#9679;</span>
            {{this.validationStatusInformation.label}}
          </PixTag>
        </div>
      </div>

      <div class="page-actions">
        <PlayModuleButtons @module={{@model.draftModule}} />

        <div class="module__separator"></div>

        <PixButtonLink
          @route="authenticated.modules.edit-draft-module"
          @model={{@model.draftModule.id}}
          class="pix-button-link-with-icon white-font"
          @iconBefore="edit"
        >
          {{t "modules.draft-module.edit"}}
        </PixButtonLink>
        <PublishModuleButton @draftModule={{@model.draftModule}} />
      </div>
    </header>
    <main class="page-body">
      <section class="page-section module-form">
        <ModuleNotification @module={{@model.draftModule}} />
        {{#if this.hasValidationErrors}}
          <ModuleValidationErrors @validationErrors={{this.validationErrors}} />
        {{/if}}

        {{#if @model.draftModule.isEditionDraft}}
          <DraftModuleDiff @draftModule={{@model.draftModule}} @htmlDiff={{@model.draftModuleDiff.htmlDiff}} />
        {{else}}
          <ModuleForm @module={{@model.draftModule}} @readonly={{true}} />
        {{/if}}
      </section>
    </main>
  </template>
}
