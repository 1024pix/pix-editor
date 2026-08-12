import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import DraftModuleDiff from 'pixeditor/components/modules/draft-module-diff';
import ModuleBackButton from 'pixeditor/components/modules/module-back-button';
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

  get validationStatusLabel() {
    return this.validationStatus
      ? this.intl.t('modules.draft-module.validation-success')
      : this.intl.t('modules.draft-module.validation-failure');
  }

  get validationStatusColor() {
    return this.validationStatus ? 'green' : 'error';
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
    <header class="page-header">
      <PixBreadcrumb @links={{this.links}} />

      <h1 class="page-title">{{t "modules.draft-module.title"}}</h1>
      <div class="page-actions">
        <PlayModuleButtons @module={{@model.draftModule}} />
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
        <dl class="draft-module__description">
          <dt>
            {{t "modules.draft-module.validation-status-label"}}
          </dt>
          <dd><PixTag @color={{this.validationStatusColor}}>
              {{this.validationStatusLabel}}
            </PixTag></dd>
        </dl>
        {{#if this.hasValidationErrors}}
          <ModuleValidationErrors @validationErrors={{this.validationErrors}} />
        {{/if}}

        {{#if @model.draftModule.isEditionDraft}}
          <DraftModuleDiff @draftModule={{@model.draftModule}} @htmlDiff={{@model.draftModuleDiff.htmlDiff}} />
        {{else}}
          <ModuleForm @module={{@model.draftModule}} @readonly={{true}} />
        {{/if}}
        <div class="page-actions">
          <ModuleBackButton />
        </div>
      </section>
    </main>
  </template>
}
