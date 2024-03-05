import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class EditStaticCourseController extends Controller {
  @service store;
  @service router;
  @service notifications;

  get challengeIdsAsStringWithBreakLines() {
    return this.model.staticCourse.sortedChallengeSummaries.toArray()
      .map((challengeSummary) => challengeSummary.id)
      .join('\n');
  }

  get tagIds() {
    return this.model.staticCourse.tags.toArray()
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(({ id }) => id);
  }

  @action
  async editStaticCourse(formData) {
    try {
      await this.model.staticCourse.save({ adapterOptions: { ...formData, action: 'update' } });
      this.notifications.success('Test statique modifié avec succès.');
      this.router.transitionTo('authenticated.static-courses.static-course.details', this.model.staticCourse.id);
    } catch (err) {
      await this.notifications.error('Une erreur est survenue lors de la modification du test statique.');
      const knownErrors = err?.errors;
      const finalErrors = knownErrors
        ? _cleanErrors(knownErrors)
        : JSON.stringify(err);
      throw new Error(finalErrors);
    }
  }

  @action
  async goBackToDetails() {
    this.router.transitionTo('authenticated.static-courses.static-course.details', this.model.staticCourse.id);
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
