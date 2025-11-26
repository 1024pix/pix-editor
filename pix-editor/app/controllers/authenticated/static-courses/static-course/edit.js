import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import sortBy from 'lodash/sortBy';

export default class EditStaticCourseController extends Controller {
  @service store;
  @service router;
  @service notifications;

  get challengeIdsAsStringWithBreakLines() {
    return [...this.model.staticCourse.sortedChallengeSummaries]
      .map((challengeSummary) => challengeSummary.id)
      .join('\n');
  }

  get tagIds() {
    const tags = this.model.staticCourse.hasMany('tags').value();
    const sortedTags = sortBy(tags, 'label');
    return sortedTags.map(({ id }) => id);
  }

  @action
  async editStaticCourse(formData) {
    try {
      await this.model.staticCourse.save({ adapterOptions: { ...formData, action: 'update' } });
      this.notifications.success('Test statique modifié avec succès.');
      this.router.transitionTo('authenticated.static-courses.static-course.details', this.model.staticCourse.id);
    } catch (err) {
      await this.notifications.error('Une erreur est survenue lors de la modification du test statique.');
      const knownErrors = err?.errors.map((error) => error.detail).join('\n');
      const finalErrors = knownErrors ?? JSON.stringify(err);
      throw new Error(finalErrors);
    }
  }

  @action
  async goBackToDetails() {
    this.router.transitionTo('authenticated.static-courses.static-course.details', this.model.staticCourse.id);
  }
}
