import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class StaticCoursesController extends Controller {
  @service router;
  @service notifications;
  @tracked shouldDisplayDeactivationModal = false;
  @tracked deactivationReason = '';
  @tracked shouldDisplayReactivationModal = false;

  get canEditStaticCourse() {
    return this.model.userMayEditStaticCourse && this.model.staticCourse.isActive;
  }

  get canDeactivateOrReactivateStaticCourse() {
    return this.model.userMayEditStaticCourse;
  }

  @action
  copyStaticCoursePreviewUrl(staticCourse) {
    navigator.clipboard.writeText(staticCourse.previewURL);
  }

  @action
  showActivationModal() {
    if (this.model.staticCourse.isActive) {
      this.shouldDisplayDeactivationModal = true;
      this.deactivationReason = '';
    } else {
      this.shouldDisplayReactivationModal = true;
    }
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
  closeReactivationModal() {
    this.shouldDisplayReactivationModal = false;
  }

  @action
  async deactivateStaticCourse() {
    try {
      await this.model.staticCourse.save({ adapterOptions: { reason: this.deactivationReason.trim(), action: 'deactivate' } });
      this.notifications.success('Test statique désactivé avec succès.');
    } catch (err) {
      await this.notifications.error('Une erreur est survenue lors de la désactivation du test statique.');
    } finally {
      this.shouldDisplayDeactivationModal = false;
    }
  }

  @action
  async reactivateStaticCourse() {
    try {
      await this.model.staticCourse.save({ adapterOptions: { action: 'reactivate' } });
      this.notifications.success('Test statique réactivé avec succès.');
    } catch (err) {
      await this.notifications.error('Une erreur est survenue lors de la réactivation du test statique.');
    } finally {
      this.shouldDisplayReactivationModal = false;
    }
  }
}
