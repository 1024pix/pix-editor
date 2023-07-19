import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class EditStaticCourseController extends Controller {
  @service store;
  @service router;

  @action
  async editStaticCourse(formData) {
    try {
      await this.model.save({ adapterOptions: formData });
      this.router.transitionTo('authenticated.static-courses.static-course.details', this.model.id);
    } catch (err) {
      const knownErrors = err?.errors;
      const finalErrors = knownErrors
        ? _cleanErrors(knownErrors)
        : JSON.stringify(err);
      throw new Error(finalErrors);
    }
  }

  @action
  async goBackToDetails() {
    this.router.transitionTo('authenticated.static-courses.static-course.details', this.model.id);
  }

  get challengeIdsAsStringWithBreakLines() {
    return this.model.sortedChallengeSummaries.toArray()
      .map((challengeSummary) => challengeSummary.id)
      .join('\n');
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
    } else if (error.code === 'UNKNOWN_RESOURCES') {
      cleanErrors += `Les épreuves suivantes n'existent pas : ${error.detail.join(', ')}.\n`;
    } else if (error.code === 'DUPLICATES_FORBIDDEN') {
      cleanErrors += `Les épreuves suivantes ont été ajoutées plusieurs fois : ${error.detail.join(', ')}.\n`;
    } else {
      cleanErrors += JSON.stringify(error);
    }
    cleanErrors += '\n';
  }
  return cleanErrors;
}
