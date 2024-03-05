import Component from '@glimmer/component';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class StaticCourseForm extends Component {
  @service store;

  @tracked name = new NameField();
  @tracked description = new DescriptionField();
  @tracked challengeIds = new ChallengeIdsField();
  @tracked isFormInvalid = true;
  @tracked isSubmitting = false;
  @tracked tagOptions = [];
  @tracked selectedTagIds = [];
  @tracked selectedTags = [];
  @tracked errorMessages = A([]);

  constructor(...args) {
    super(...args);

    if (this.args.initialName.length > 0) {
      this.name.setValue(this.args.initialName);
      this.name.validate();
    }
    if (this.args.initialDescription.length > 0) {
      this.description.setValue(this.args.initialDescription);
      this.description.validate();
    }
    if (this.args.initialChallengeIds.length > 0) {
      this.challengeIds.setValue(this.args.initialChallengeIds);
      this.challengeIds.validate();
    }
    if (this.args.initialTagIds.length > 0) {
      this.selectedTagIds = this.args.initialTagIds;
      this.updateDisplayedTags();
    }
    for (const tag of this.args.staticCourseTags.toArray()) {
      this.tagOptions.push({ value: tag.id, label: tag.label });
    }
    this.tagOptions.sort((a, b) => a.label.localeCompare(b.label));
    this.checkFormValidity();
  }

  @action
  onTagClicked(tagIds) {
    this.selectedTagIds = tagIds;
    this.updateDisplayedTags();
  }

  @action
  async onSubmitClicked(event) {
    event.preventDefault();
    this.errorMessages.length = 0;
    this.isSubmitting = true;
    const formData = {
      name: this.name.getValueForSubmit(),
      description: this.description.getValueForSubmit(),
      challengeIds: this.challengeIds.getValueForSubmit(),
      tagIds: this.selectedTagIds,
    };
    try {
      await this.args.onFormSubmitted(formData);
    } catch (err) {
      this.errorMessages.pushObjects(err.message.split('\n'));
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

  updateDisplayedTags() {
    this.selectedTags = this.args.staticCourseTags.toArray()
      .filter(({ id }) => this.selectedTagIds.includes(id))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
}

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
