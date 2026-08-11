import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import ModuleForm from 'pixeditor/components/modules/module-form';
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
    } catch {
      this.notifications.sendError(this.intl.t('modules.new.draft-error'));
    } finally {
      this.loader.stop();
    }
  }

  get hasValidationErrors() {
    return !this.args.model.draftModule.hasBeenValidated && this.validationErrors?.length > 0;
  }

  get validationErrors() {
    return this.args.model.draftModule.validationErrors;
  }

  <template>
    <header class="page-header">
      <h1 class="page-title">
        {{t "modules.edit-draft-module.title"}}
      </h1>
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
