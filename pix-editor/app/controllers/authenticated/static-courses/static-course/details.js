import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class StaticCoursesController extends Controller {
  @service router;
  @service notifications;
  @tracked shouldDisplayDeactivationModal = false;
  @tracked deactivationReason = '';

  get canEditStaticCourse() {
    return this.model.userMayEditStaticCourse && this.model.staticCourse.isActive;
  }

  get canDeactivateStaticCourse() {
    return this.model.userMayEditStaticCourse && this.model.staticCourse.isActive;
  }

  @action
  copyStaticCoursePreviewUrl(staticCourse) {
    navigator.clipboard.writeText(staticCourse.previewURL);
  }

  @action
  showDeactivationModal() {
    this.shouldDisplayDeactivationModal = true;
    this.deactivationReason = '';
  }

  @action
  closeDeactivationModal() {
    this.shouldDisplayDeactivationModal = false;
  }

  @action
  setDeactivationReason(event) {
    this.deactivationReason = event.target.value;
  }

  @action
  async deactivateStaticCourse() {
    try {
      await this.model.staticCourse.save({ adapterOptions: { reason: this.deactivationReason.trim(), action: 'deactivate' } });
      this.notifications.success('Test statique désactivé avec succès.');
    } catch (err) {
      await this.notifications.error('Une erreur est survenue lors de la désactivation du test statique.');
    }
    finally {
      this.shouldDisplayDeactivationModal = false;
    }
  }
}
