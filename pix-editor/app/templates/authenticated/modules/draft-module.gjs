import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import formatDate from 'ember-intl/helpers/format-date';
import t from 'ember-intl/helpers/t';
import DraftModuleDiff from 'pixeditor/components/modules/draft-module-diff';
import ModuleForm from 'pixeditor/components/modules/module-form';
import ModuleNotification from 'pixeditor/components/modules/module-notification';
import PlayModuleButtons from 'pixeditor/components/modules/play-module-buttons';
import ModuleValidationErrors from 'pixeditor/components/modules/validation-errors';
import ModuleValidationSuccess from 'pixeditor/components/modules/validation-success';

export default class DraftModule extends Component {
  @service intl;

  @tracked editorErrors = [];

  @action
  onEditorErrorsChange(editorErrors) {
    this.editorErrors = editorErrors;
  }

  get hasValidationErrors() {
    const hasDraftValidationErrors = !this.args.model.draftModule.hasBeenValidated && this.validationErrors?.length > 0;
    return hasDraftValidationErrors || this.editorErrors.length > 0;
  }

  get validationErrors() {
    const draftModule = this.args.model.draftModule;
    // Edition drafts (drafts of an existing production module) show a diff instead of the JSON editor
    // on this page, so Monaco never surfaces schema-shape errors here: display every stored error
    // instead of only the ones Monaco can't detect, otherwise they'd go unnoticed entirely.
    return draftModule.isEditionDraft ? (draftModule.validationErrors ?? []) : draftModule.displayedValidationErrors;
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

        <div class="module-header__information">
          <h1 class="module-header__title">{{@model.draftModule.internalTitle}}</h1>
          <div class="module-header__tag module-header__tag--yellow">
            &#9679;
            {{t "modules.draft-module.information-tag"}}
          </div>
          <p class="draft-module-header__last-modified-at"><span
              class="draft-module-header__last-modified-at--bullet"
            >&#65372;</span>{{t
              "modules.draft-module.last-modified-at"
              modifiedDate=(formatDate @model.draftModule.updatedAt "DD/MM/YYYY")
            }}</p>
        </div>
      </div>

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
      </div>
    </header>
    <main class="page-body">
      <section class="page-section module-form">
        <ModuleNotification @module={{@model.draftModule}} />
        {{#if this.hasValidationErrors}}
          <ModuleValidationErrors @validationErrors={{this.validationErrors}} @editorErrors={{this.editorErrors}} />
        {{else}}
          <ModuleValidationSuccess @draftModule={{@model.draftModule}} />
        {{/if}}

        {{#if @model.draftModule.isEditionDraft}}
          <DraftModuleDiff @draftModule={{@model.draftModule}} @htmlDiff={{@model.draftModuleDiff.htmlDiff}} />
        {{else}}
          <ModuleForm
            @module={{@model.draftModule}}
            @readonly={{true}}
            @onEditorErrorsChange={{this.onEditorErrorsChange}}
          />
        {{/if}}
      </section>
    </main>
  </template>
}
