import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ModuleForm from 'pixeditor/components/modules/module-form';

export default class NewModule extends Component {
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
        this.notifications.sendSuccess(`Le draft "${newModule.internalTitle}" a été enregistré.`);
      } else {
        this.router.replaceWith('authenticated.modules.workbench');
        this.notifications.sendSuccess(`Le module "${newModule.internalTitle}" a été enregistré.`);
      }
    } catch {
      if (module) {
        this.notifications.sendError('Erreur lors de l’enregistrement du draft.');
      } else {
        this.notifications.sendError('Erreur lors de l’enregistrement du module.');
      }
    } finally {
      this.loader.stop();
    }
  }

  <template>
    <header class="page-header">
      <h1 class="page-title">
        {{#if @model.module}}
          Création d’un draft
        {{else}}
          Création d’un module
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
