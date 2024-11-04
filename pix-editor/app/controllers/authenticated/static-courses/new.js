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
      const knownErrors = err?.errors.map((error) => error.detail).join('\n');
      const finalErrors = knownErrors ?? JSON.stringify(err);
      throw new Error(finalErrors);
    }
  }

  @action
  async goBackToList() {
    this.router.transitionTo('authenticated.static-courses.list');
  }
}
