import Controller from '@ember/controller';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const STATES = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  ERROR: 'error',
};

class FormField {
  @tracked state;
  @tracked value;
  @tracked errorMessage;

  constructor({ state = STATES.DEFAULT, value = '', errorMessage = '' } = {}) {
    this.state = state;
    this.value = value;
    this.errorMessage = errorMessage;
  }

  get isError() {
    return this.state === STATES.ERROR;
  }

  get isValid() {
    return this.state === STATES.SUCCESS;
  }

  setValue(value) {
    this.value = value;
  }

  validate() { throw new Error('implement me');}

  getValueForSubmit() { throw new Error('implement me');}
}

class NameField extends FormField {
  constructor() {
    super({ errorMessage: 'Le nom est obligatoire' });
  }

  validate() {
    this.state = this.value.trim().length > 0
      ? STATES.SUCCESS
      : STATES.ERROR;
  }

  getValueForSubmit() { return this.value.trim(); }
}

class DescriptionField extends FormField {

  validate() { return STATES.SUCCESS; }

  getValueForSubmit() { return this.value.trim(); }
}

class ChallengeIdsField extends FormField {
  constructor() {
    super({ errorMessage: 'La présence d\'épreuves est obligatoire. Renseignez le champ en séparant chaque ID d\'épreuve par un retour à la ligne' });
  }

  validate() {
    this.state = this.value.trim().length > 0
      ? STATES.SUCCESS
      : STATES.ERROR;
  }

  getValueForSubmit() {
    const challengeIds = this.value.trim().split(/\r?\n|\r|\n/g);
    return challengeIds
      .map((challengeId) => challengeId.trim())
      .filter((challengeId) => challengeId.length > 0);
  }
}

export default class NewStaticCourseController extends Controller {
  @service store;
  @service router;

  @tracked name = new NameField();
  @tracked description = new DescriptionField();
  @tracked challengeIds = new ChallengeIdsField();
  @tracked isFormInvalid = true;
  @tracked isSubmitting = false;
  @tracked errorMessages = A([]);

  @action
  async createStaticCourse(event) {
    event.preventDefault();
    this.errorMessages.length = 0;
    this.isSubmitting = true;
    const formData = {
      name: this.name.getValueForSubmit(),
      description: this.description.getValueForSubmit(),
      challengeIds: this.challengeIds.getValueForSubmit(),
    };
    const staticCourse = this.store.createRecord('static-course');
    try {
      await staticCourse.save({ adapterOptions: formData });
      this.router.transitionTo('authenticated.static-courses.static-course', staticCourse.id);
    } catch (err) {
      staticCourse.deleteRecord();
      const knownErrors = err?.errors?.[0];
      if (knownErrors?.status === '400') {
        this.errorMessages.pushObjects(_cleanErrors(knownErrors.detail));
      } else {
        this.errorMessages.pushObject(JSON.stringify(err));
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  updateName(event) {
    this.name.setValue(event.target.value);
    this.name.validate();
    this.checkFormValidity();
  }

  @action
  validateName() {
    this.name.validate();
    this.checkFormValidity();
  }

  @action
  updateDescription(event) {
    this.description.setValue(event.target.value);
    this.description.validate();
    this.checkFormValidity();
  }

  @action
  updateChallengeIds(event) {
    this.challengeIds.setValue(event.target.value);
    this.challengeIds.validate();
    this.checkFormValidity();
  }

  @action
  validateChallengeIds() {
    this.challengeIds.validate();
    this.checkFormValidity();
  }

  checkFormValidity() {
    this.isFormInvalid = !this.name.isValid || !this.challengeIds.isValid;
  }
}

function _cleanErrors(errorsStr) {
  const allErrors = errorsStr.split('\n');
  const cleanErrors = [];
  for (const err of allErrors) {
    if (err.includes('Following challenges do not exist')) {
      const challengeIds = err.split(':')[1].split(',').map((challengeId) => challengeId.trim());
      cleanErrors.push(`Les épreuves suivantes n'existent pas : ${challengeIds.join(', ')}.`);
    } else if (err.includes('No challenges provided')) {
      cleanErrors.push('La présence d\'épreuves est requis pour pouvoir créer un test statique.');
    } else if (err.includes('Following challenges appear more than once')) {
      const challengeIds = err.split(':')[1].split(',').map((challengeId) => challengeId.trim());
      cleanErrors.push(`Les épreuves suivantes ont été ajoutées plusieurs fois : ${challengeIds.join(', ')}.`);
    } else if (err.includes('Invalid or empty "name"')) {
      cleanErrors.push('Le nom est obligatoire.');
    } else {
      cleanErrors.push(err);
    }
  }
  return cleanErrors;
}
