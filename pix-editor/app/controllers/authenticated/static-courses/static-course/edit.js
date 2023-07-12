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
      const knownErrors = err?.errors?.[0];
      const finalErrors = knownErrors?.status === '400'
        ? _cleanErrors(knownErrors.detail)
        : JSON.stringify(err);
      throw new Error(finalErrors);
    }
  }

  @action
  async goBackToDetails() {
    this.router.transitionTo('authenticated.static-courses.static-course.details', this.model.id);
  }
}

function _cleanErrors(errorsStr) {
  const allErrors = errorsStr.split('\n');
  let cleanErrors = '';
  for (const err of allErrors) {
    if (err.includes('Following challenges do not exist')) {
      const challengeIds = err.split(':')[1].split(',').map((challengeId) => challengeId.trim());
      cleanErrors += `Les épreuves suivantes n'existent pas : ${challengeIds.join(', ')}.\n`;
    } else if (err.includes('No challenges provided')) {
      cleanErrors += 'La présence d\'épreuves est requis pour pouvoir créer un test statique.\n';
    } else if (err.includes('Following challenges appear more than once')) {
      const challengeIds = err.split(':')[1].split(',').map((challengeId) => challengeId.trim());
      cleanErrors += `Les épreuves suivantes ont été ajoutées plusieurs fois : ${challengeIds.join(', ')}.\n`;
    } else if (err.includes('Invalid or empty "name"')) {
      cleanErrors += 'Le nom est obligatoire.\n';
    } else {
      cleanErrors += `${err}\n`;
    }
  }
  return cleanErrors;
}
