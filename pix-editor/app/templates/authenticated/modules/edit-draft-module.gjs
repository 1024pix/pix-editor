import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import ModuleForm from 'pixeditor/components/modules/module-form';
import ModulixEditorButton from 'pixeditor/components/modules/modulix-editor-button';
import ModuleValidationErrors from 'pixeditor/components/modules/validation-errors';

export default class NewModule extends Component {
  @service intl;
  @service loader;
  @service notifications;
  @service router;
  @service store;

  @action
  async saveModule({ internalTitle, title, isBeta, slug, visibility, details, sections, glossary }) {
    const { draftModule } = this.args.model;

    Object.assign(draftModule, {
      internalTitle,
      title,
      isBeta,
      slug,
      visibility,
      details,
      sections,
      glossary,
    });

    try {
      this.loader.start();
      await draftModule.save();
      this.router.replaceWith('authenticated.modules.draft-module', draftModule.id);
      this.notifications.sendSuccess(this.intl.t('modules.new.draft-success', { title: draftModule.internalTitle }));
    } catch (error) {
      const genericErrorMessage = this.intl.t('modules.new.draft-error');
      let errorMessage = genericErrorMessage;

      if (error.errors?.length) {
        const details = error.errors.map((error) => error.detail.replace(/"data\.attributes\.([^"]+)"/, '$1'));
        const detailLabel = this.intl.t('modules.new.draft-error-detail');
        errorMessage = `${genericErrorMessage}<br><br>${detailLabel} ${details.join(', ')}.`;
      }
      this.notifications.sendError(htmlSafe(errorMessage));
    } finally {
      this.loader.stop();
    }
  }

  get draftModuleModulixEditorFormat() {
    return {
      id: this.args.model.draftModule.id,
      shortId: this.args.model.draftModule.shortId,
      title: this.args.model.draftModule.title,
      isBeta: this.args.model.draftModule.isBeta,
      slug: this.args.model.draftModule.slug,
      visibility: this.args.model.draftModule.visibility,
      details: this.args.model.draftModule.details,
      sections: this.args.model.draftModule.sections,
      glossary: this.args.model.draftModule.glossary,
    };
  }

  get hasValidationErrors() {
    return !this.args.model.draftModule.hasBeenValidated && this.validationErrors?.length > 0;
  }

  get validationErrors() {
    return this.args.model.draftModule.validationErrors;
  }

  get links() {
    return [
      {
        route: 'authenticated.modules.workbench',
        label: this.intl.t('modules.breadcrumb.workbench.label'),
      },
      {
        route: 'authenticated.modules.draft-module',
        label: this.intl.t('modules.breadcrumb.draft-module.label'),
        model: this.args.model.draftModule.id,
      },
      {
        label: this.intl.t('modules.breadcrumb.edit-draft-module.label'),
      },
    ];
  }

  <template>
    <header class="module__header">
      <div>
        <PixBreadcrumb class="module-header__breadcrumb" @links={{this.links}} />

        <h1 class="module-header__title">
          {{@model.draftModule.internalTitle}}
        </h1>
      </div>
      <div class="page-actions">
        <ModulixEditorButton @moduleContent={{this.draftModuleModulixEditorFormat}} />
      </div>
    </header>
    <main class="page-body">
      <section class="page-section module-form">
        {{#if this.hasValidationErrors}}
          <ModuleValidationErrors @validationErrors={{this.validationErrors}} />
        {{/if}}

        <ModuleForm @module={{@model.draftModule}} @saveModule={{this.saveModule}} />
      </section>
    </main>
  </template>
}
