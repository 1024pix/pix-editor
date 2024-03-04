import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class NewStaticCourseController extends Controller {
  @service store;
  @service router;
  @service notifications;

  @action
  async createStaticCourse(formData) {
    const staticCourse = this.store.createRecord('static-course');
    try {
      await staticCourse.save({ adapterOptions: formData });
      this.notifications.success('Test statique créé avec succès.');
      this.router.transitionTo('authenticated.static-courses.static-course.details', staticCourse.id);
    } catch (err) {
      staticCourse.deleteRecord();
      await this.notifications.error('Une erreur est survenue lors de la création du test statique.');
      const knownErrors = err?.errors;
      const finalErrors = knownErrors
        ? _cleanErrors(knownErrors)
        : JSON.stringify(err);
      throw new Error(finalErrors);
    }
  }

  @action
  async goBackToList() {
    this.router.transitionTo('authenticated.static-courses.list');
  }
}

function _cleanErrors(errors) {
  let cleanErrors = '';
  for (const error of errors) {
    if (error.code === 'MANDATORY_FIELD') {
      if (error.source.pointer.endsWith('name'))
        cleanErrors += 'Le nom est obligatoire.';
      else if (error.source.pointer.endsWith('challenge-ids'))
        cleanErrors += 'La présence d\'épreuves est requise pour pouvoir créer un test statique.';
      else
        cleanErrors += JSON.stringify(error);
    } else if (error.source.pointer.endsWith('challenge-ids')) {
      if (error.code === 'UNKNOWN_RESOURCES') {
        cleanErrors += `Les épreuves suivantes n'existent pas : ${error.detail.join(', ')}.\n`;
      } else if (error.code === 'DUPLICATES_FORBIDDEN') {
        cleanErrors += `Les épreuves suivantes ont été ajoutées plusieurs fois : ${error.detail.join(', ')}.\n`;
      } else {
        cleanErrors += JSON.stringify(error);
      }
    } else if (error.source.pointer.endsWith('tag-ids')) {
      if (error.code === 'UNKNOWN_RESOURCES') {
        cleanErrors += `Les tags suivants n'existent pas : ${error.detail.join(', ')}.\n`;
      } else if (error.code === 'DUPLICATES_FORBIDDEN') {
        cleanErrors += `Les tags suivants ont été ajoutées plusieurs fois : ${error.detail.join(', ')}.\n`;
      } else {
        cleanErrors += JSON.stringify(error);
      }
    } else {
      cleanErrors += JSON.stringify(error);
    }
    cleanErrors += '\n';
  }
  return cleanErrors;
}
