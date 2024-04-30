import Component from '@glimmer/component';
import { A } from '@ember/array';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MissionForm extends Component {
  @service currentData;
  @service store;

  @tracked name = new NameField();
  @tracked thematicIds = new ThematicIdsField();
  @tracked selectedCompetenceId = new CompetenceIdField();
  @tracked selectedStatus = 'ACTIVE';
  @tracked validatedObjectives = null;
  @tracked learningObjectives = null;
  @tracked errorMessages = A([]);
  @tracked isSubmitting = false;
  @tracked isFormValid = false;

  constructor(...args) {
    super(...args);
    if (this.editMode()) {
      this.name.setValue(this.args.mission.name);
      this.name.validate();
      this.selectedStatus = this.args.mission.status;
      this.validatedObjectives = this.args.mission.validatedObjectives;
      this.learningObjectives = this.args.mission.learningObjectives;
      this.isFormValid = true;
      this.thematicIds.setValue(this.args.mission.thematicIds);
    }

    if (this.args.mission.competenceId?.length > 0) {
      this.selectedCompetenceId.setValue(this.args.mission.competenceId);
      this.selectedCompetenceId.validate();
      this.updateAvailableThematicIds(this.args.mission.competenceId);
    }

    this.thematicIds.validate();
  }

  editMode() {
    return this.args.mission.name?.length > 0;
  }

  get statusOptions() {
    return [{ value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }];
  }

  get competencesOptions() {
    return this.args.competences.map((competence) => {
      return { value: competence.pixId, label: competence.title };
    });
  }

  @action
  async onSubmitClicked(event) {
    event.preventDefault();
    this.errorMessages.length = 0;
    this.isSubmitting = true;
    const formData = {
      name: this.name.getValueForSubmit(),
      competenceId: this.selectedCompetenceId.value,
      thematicIds: this.thematicIds.getValueForSubmit(),
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
  updateThematicIds(event) {
    this.thematicIds.setValue(event.target.value);
    this.checkFormValidity();
  }

  @action
  validateThematicIds() {
    this.thematicIds.validate();
    this.checkFormValidity();
  }

  @action
  validateCompetence() {
    this.selectedCompetenceId.validate();
    this.checkFormValidity();
  }

  @action
  changeStatus(value) {
    this.selectedStatus = value;
  }

  @action
  changeCompetence(value) {
    this.selectedCompetenceId.setValue(value);
    this.selectedCompetenceId.validate();
    this.checkFormValidity();
    this.updateAvailableThematicIds(value);
  }

  checkFormValidity() {
    this.isFormValid = !!this.selectedCompetenceId.value && !!this.name.getValueForSubmit() && this.thematicIds.isValid;
  }

  @action
  updateAvailableThematicIds(competenceId) {
    const filteredCompetence = this.args.competences.filter((competence) => competence.pixId === competenceId);
    const availableThematicIds = filteredCompetence[0].themes.map((thematic) => thematic.id);
    this.thematicIds.setAvailableThematicIds(availableThematicIds);
  }

  @action
  updateLearningObjectives(event) {
    this.learningObjectives = event.target.value;
  }

  @action
  updateValidatedObjectives(event) {
    this.validatedObjectives = event.target.value;
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

class ThematicIdsField extends FormField {
  constructor() {
    super({ errorMessage: 'Le champ doit contenir des identifiants de thématique de la compétence séparés par des virgules' });
  }

  setAvailableThematicIds(availableThematicIds) {
    this.availableThematicIds = availableThematicIds;
  }

  validate() {
    if (this.value?.length === 0 || this.allThematicIdsExist()) {
      this.state = STATES.SUCCESS;
    } else {
      this.state = STATES.ERROR;
    }
  }

  allThematicIdsExist() {
    return this.value?.split(',').every((thematicId) => this.availableThematicIds?.includes(thematicId.trim()));
  }

  getValueForSubmit() { return this.value.split(',').map((element)=> element.trim()).join(','); }
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
    super();
  }

  validate() {
    this.state = this.value.trim().length > 0
      ? STATES.SUCCESS
      : STATES.ERROR;
    if (this.state == STATES.ERROR) {
      this.errorMessage = 'La présence d\'une competence est obligatoire. Renseignez le champ';
    } else {
      this.errorMessage = '';
    }
  }
}

