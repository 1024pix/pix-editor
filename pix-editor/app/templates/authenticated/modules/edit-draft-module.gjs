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
      this.notifications.sendSuccess(`Le draft "${draftModule.internalTitle}" a été enregistré.`);
    } catch {
      this.notifications.sendError('Erreur lors de l’enregistrement du draft.');
    } finally {
      this.loader.stop();
    }
  }

  <template>
    <header class="page-header">
      <h1 class="page-title">
        Édition du draft de module
      </h1>
    </header>
    <main class="page-body">
      <section class="page-section module-form">
        <ModuleForm @module={{@model.draftModule}} @saveModule={{this.saveModule}} />
      </section>
    </main>
  </template>
}
