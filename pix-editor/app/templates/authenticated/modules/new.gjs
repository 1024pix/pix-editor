import PixBreadcrumb from '@1024pix/pix-ui/components/pix-breadcrumb';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import ModuleForm from 'pixeditor/components/modules/module-form';
import ModulixEditorButton from 'pixeditor/components/modules/modulix-editor-button';

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

  get links() {
    if (this.args.model.module) {
      return [
        {
          route: 'authenticated.modules.production',
          label: this.intl.t('modules.breadcrumb.production.label'),
        },
        {
          route: 'authenticated.modules.production-module',
          label: this.intl.t('modules.breadcrumb.production-module.label'),
          model: this.args.model.module.id,
        },
        {
          label: this.intl.t('modules.breadcrumb.new-module.label'),
        },
      ];
    } else {
      return [
        {
          route: 'authenticated.modules',
          label: this.intl.t('modules.breadcrumb.all-modules.label'),
        },
        {
          label: this.intl.t('modules.breadcrumb.new-module.label'),
        },
      ];
    }
  }

  <template>
    <header class="module__header">
      <div>
        <PixBreadcrumb class="module-header__breadcrumb" @links={{this.links}} />
        <h1 class="module-header__title">
          {{#if @model.module}}
            {{@model.module.internalTitle}}
          {{else}}
            {{t "modules.new.module-title"}}
          {{/if}}
        </h1>
      </div>
      <ModulixEditorButton />
    </header>
    <main class="page-body">
      <section class="page-section module-form">
        <ModuleForm @module={{@model.module}} @saveModule={{this.saveModule}} />
      </section>
    </main>
  </template>
}
