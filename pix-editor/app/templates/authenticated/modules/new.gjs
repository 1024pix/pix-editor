import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import ModuleForm from 'pixeditor/components/modules/module-form';

export default class NewModule extends Component {
  @service loader;
  @service notifications;
  @service router;
  @service store;

  @action
  async saveModule({ title, isBeta, slug, visibility, details, sections, glossary }) {
    const newModule = this.store.createRecord('module', {
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
      await newModule.save();
      this.router.replaceWith('authenticated.modules');
      this.notifications.sendSuccess(`Le module "${newModule.title}" a été enregistré.`);
    } catch (err) {
      this.notifications.sendError('Erreur lors de l’enregistrement du module.');
    } finally {
      this.loader.stop();
    }
  }

  <template>
    <header class="page-header">
      <h1 class="page-title">Création d'un module</h1>
    </header>
    <main class="page-body">
      <section class="page-section module-form">
        <ModuleForm @saveModule={{this.saveModule}} />
      </section>
    </main>
  </template>
}
