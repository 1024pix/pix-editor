import Component from '@glimmer/component';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MissionForm extends Component {
  @service currentData;
  @service store;

  @tracked name = new NameField();
  @tracked thematicId = null;
  @tracked competenceId = new CompetenceIdField();
  @tracked selectedStatus = 'ACTIVE';
  @tracked validatedObjectives = null;
  @tracked learningObjectives = null;
  @tracked errorMessages = A([]);

  get statusOptions() {
    return [{ value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }];
  }

  //TODO: à décommenter quand on affichera la liste des compétences pour le référentiel PIX 1D
  // get competencesOptions() {
  //   // this.currentData.getCompetence().map((competence) => { value: competence.id, label: });
  //   return []
  // }

  @action
  async onSubmitClicked(event) {
    event.preventDefault();
    this.errorMessages.length = 0;
    this.isSubmitting = true;
    const formData = {
      name: this.name.getValueForSubmit(),
      competenceId: this.competenceId.getValueForSubmit(),
      thematicId: this.thematicId,
      status: this.selectedStatus,
      learningObjectives: this.learningObjectives,
      validatedObjectives: this.validatedObjectives

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
  changeStatus(value) {
    this.selectedStatus = value;
  }

  checkFormValidity() {
    this.isFormInvalid = !this.name.isValid && !this.competenceId.isValid;
  }

  @action
  updateLearningObjectives(event) {
    this.learningObjectives = event.target.value;
  }

  @action
  updateValidatedObjectives(event) {
    this.validatedObjectives = event.target.value;
  }

  //TODO: À supprimer quand on affichera la liste des compétences pour le référentiel PIX 1D
  @action
  validateComptenceId() {
    this.competenceId.validate();
    this.checkFormValidity();
  }

  @action
  updateCompetenceId(event) {
    this.competenceId.setValue(event.target.value);
    this.competenceId.validate();
    this.checkFormValidity();
  }
  @action
  updateThematicId(event) {
    this.thematicId = event.target.value;
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

class CompetenceIdField extends FormField {
  constructor() {
    super({ errorMessage: 'La présence de competenceId est obligatoire. Renseignez le champ' });
  }

  validate() {
    this.state = this.value.trim().length > 0
      ? STATES.SUCCESS
      : STATES.ERROR;
  }

  getValueForSubmit() { return this.value.trim(); }
}
