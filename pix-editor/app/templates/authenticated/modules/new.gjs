import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import ModuleForm from 'pixeditor/components/modules/module-form';

export default class NewModule extends Component {
  @service intl;
  @service loader;
  @service notifications;
  @service router;
  @service store;

  @action
  async saveModule({ internalTitle, title, isBeta, slug, visibility, details, sections, glossary }) {
    const { module } = this.args.model;

    const newModule = this.store.createRecord('draft-module', {
      internalTitle,
      title,
      isBeta,
      slug,
      visibility,
      details,
      sections,
      glossary,
      module,
    });

    try {
      this.loader.start();
      await newModule.save();
      if (module) {
        this.router.replaceWith('authenticated.modules.draft-module', newModule.id);
        this.notifications.sendSuccess(this.intl.t('modules.new.draft-success', { title: newModule.internalTitle }));
      } else {
        this.router.replaceWith('authenticated.modules.workbench');
        this.notifications.sendSuccess(this.intl.t('modules.new.module-success', { title: newModule.internalTitle }));
      }
    } catch {
      if (module) {
        this.notifications.sendError(this.intl.t('modules.new.draft-error'));
      } else {
        this.notifications.sendError(this.intl.t('modules.new.module-error'));
      }
    } finally {
      this.loader.stop();
    }
  }

  <template>
    <header class="page-header">
      <h1 class="page-title">
        {{#if @model.module}}
          {{t "modules.new.draft-title"}}
        {{else}}
          {{t "modules.new.module-title"}}
        {{/if}}
      </h1>
    </header>
    <main class="page-body">
      <section class="page-section module-form">
        <ModuleForm @module={{@model.module}} @saveModule={{this.saveModule}} />
      </section>
    </main>
  </template>
}
