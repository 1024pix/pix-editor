import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import MissionSummary from '../../models/mission-summary';
import { on } from '@ember/modifier';
import Card from 'pixeditor/components/card';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import not from 'ember-truth-helpers/helpers/not';

export default class MissionForm extends Component {
<template><form {{on "submit" this.onSubmitClicked}} class="new-mission-form">
  <Card class="new-mission-form__card" @title={{@submitButtonText}}>
    <PixInput @id="mission-name" @value={{this.name.value}} @errorMessage="{{this.name.errorMessage}}" @requiredLabel="{{this.name.errorMessage}}" @validationStatus={{this.name.state}} {{on "focusout" this.validateName}} {{on "keyup" this.updateName}}>
      <:label>Nom de la mission</:label>
    </PixInput>
    <PixInput @id="mission-card-image-url" @value={{this.cardImageUrl}} {{on "change" this.updateCardImageUrl}}>
      <:label>URL de l'image de la carte</:label>
    </PixInput>
    <PixSelect @options={{this.statusOptions}} @value={{this.selectedStatus}} @hideDefaultOption={{true}} @onChange={{this.changeStatus}} @requiredLabel="{{this.name.errorMessage}}">
      <:label>Statut</:label>
    </PixSelect>

    <PixSelect class="new-mission-form__select" @hideDefaultOption={{true}} @options={{this.competencesOptions}} @onChange={{this.changeCompetence}} @value={{this.selectedCompetenceId.value}} @requiredLabel="champ requis" @errorMessage="{{this.selectedCompetenceId.errorMessage}}" {{on "focusout" this.validateCompetence}}>
      <:label>Compétence</:label>
    </PixSelect>

    <PixInput @id="thematic-ids" @value={{this.thematicIds.value}} @errorMessage="{{this.thematicIds.errorMessage}}" @validationStatus={{this.thematicIds.state}} {{on "focusout" this.validateThematicIds}} {{on "keyup" this.updateThematicIds}}>
      <:label>Liste des thématiques</:label>
    </PixInput>

    <label class="new-mission-form__label-text-area" for="mission-learning-objectives">Objectifs d'apprentissage</label>
    <p class="new-mission-form__description">Ce texte s’affichera dans l’écran de début de mission.</p>
    <PixTextarea @id="mission-learning-objectives" @value={{this.learningObjectives}} {{on "change" this.updateLearningObjectives}} />

    <label class="new-mission-form__label-text-area" for="mission-validated-objectives">Objectifs validés dans la
      mission</label>
    <p class="new-mission-form__description">Ce texte s’affichera dans l’écran de fin de mission.<br>Attention, pour le moment, cet
      élément n'est utilisé que pour de l’affichage dans Pix Junior</p>
    <PixTextarea @id="mission-validated-objectives" @value={{this.validatedObjectives}} {{on "change" this.updateValidatedObjectives}} />

    <section class="new-mission-form__mission-introduction">
      <h2 class=" mission-introduction__title">Introduction à la mission</h2>
      <p class="mission-introduction__description">Ce média s’affichera avant de démarrer la mission, avant la première
        épreuve. <br> Lorsqu'une URL est précisée, elle doit être obligatoirement accompagnée du type de média. <br>
        Si le média est de type image, un texte alternatif doit être renseigné.</p>

      <label class="new-mission-form__label-text-area" for="mission-introduction-media-url">URL du média d'introduction
        de la mission</label>
      <PixInput @id="mission-introduction-media-url" @value={{this.introductionMediaUrl}} {{on "change" this.updateIntroductionMediaUrl}} />

      <PixSelect @options={{this.typeOptions}} @onChange={{this.updateIntroductionMediaType}} @value={{this.introductionMediaType}} @placeholder="-- Sélectionner un type --">
        <:label>Type de média</:label>
      </PixSelect>

      <label class="new-mission-form__label-text-area" for="mission-introduction-media-alt">Texte alternatif pour le média
        d'introduction</label>
      <PixInput @id="mission-introduction-media-alt" @value={{this.introductionMediaAlt}} {{on "change" this.updateIntroductionMediaAlt}} />
    </section>

    <label class="new-mission-form__label-text-area" for="mission-documentation-url">URL de la documentation de la mission</label>
      <PixInput @id="mission-documentation-url" @value={{this.documentationUrl}} {{on "change" this.updateDocumentationUrl}} />

  </Card>

  <div class="form-error">
    {{#each this.errorMessages as |errorMessage|}}
      {{errorMessage}}<br />
    {{/each}}
  </div>

  <div class="page-actions">
    <PixButton @backgroundColor="transparent-light" @isBorderVisible={{true}} @triggerAction={{@onFormCancelled}}>
      Annuler
    </PixButton>
    <PixButton @type="submit" @isDisabled={{not this.isFormValid}} @isLoading={{this.isSubmitting}}>
      {{@submitButtonText}}
    </PixButton>
  </div>
</form>
</template>

@service currentData;
@service store;

@tracked name = new NameField();
@tracked cardImageUrl = null;
@tracked thematicIds = new ThematicIdsField();
@tracked selectedCompetenceId = new CompetenceIdField();
@tracked selectedStatus = 'ACTIVE';
@tracked validatedObjectives = null;
@tracked learningObjectives = null;
@tracked introductionMediaUrl = null;
@tracked introductionMediaAlt = null;
@tracked introductionMediaType = null;
@tracked documentationUrl = null;
@tracked errorMessages = A([]);
@tracked isSubmitting = false;
@tracked isFormValid = false;

constructor(...args) {
  super(...args);
  if (this.editMode()) {
    this.name.setValue(this.args.mission.name);
    this.name.validate();
    this.cardImageUrl = this.args.mission.cardImageUrl;
    this.selectedStatus = this.args.mission.status;
    this.validatedObjectives = this.args.mission.validatedObjectives;
    this.learningObjectives = this.args.mission.learningObjectives;
    this.introductionMediaUrl = this.args.mission.introductionMediaUrl;
    this.introductionMediaType = this.args.mission.introductionMediaType;
    this.introductionMediaAlt = this.args.mission.introductionMediaAlt;
    this.documentationUrl = this.args.mission.documentationUrl;
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
  return Object.keys(MissionSummary.statuses).map((status) => {
    return {
      value: MissionSummary.statuses[status],
      label: MissionSummary.displayableStatuses[status],
    };
  });
}

get typeOptions() {
  return [{ value: 'image', label: 'Image' }, { value: 'video', label: 'Vidéo' }];
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
    cardImageUrl: this.cardImageUrl,
    competenceId: this.selectedCompetenceId.value,
    thematicIds: this.thematicIds.getValueForSubmit(),
    status: this.selectedStatus,
    learningObjectives: this.learningObjectives,
    validatedObjectives: this.validatedObjectives,
    introductionMediaUrl: this.introductionMediaUrl,
    introductionMediaAlt: this.introductionMediaAlt,
    introductionMediaType: this.introductionMediaType,
    documentationUrl: this.documentationUrl,
  };
  try {
    await this.args.onFormSubmitted(formData);
  } catch (err) {
    this.errorMessages.push(...err.message.split('\n'));
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
updateCardImageUrl(event) {
  this.cardImageUrl = event.target.value;
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
updateIntroductionMediaType(value) {
  this.introductionMediaType = value;
}

@action
updateIntroductionMediaAlt(event) {
  this.introductionMediaAlt = event.target.value;
}

@action
updateIntroductionMediaUrl(event) {
  this.introductionMediaUrl = event.target.value;
}

@action
updateDocumentationUrl(event) {
  this.documentationUrl = event.target.value;
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
  const availableThematicIds = filteredCompetence[0].themes.map((thematic) => thematic.pixId);
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

  validate() {
    throw new Error('implement me');
  }

  getValueForSubmit() {
    throw new Error('implement me');
  }
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

  getValueForSubmit() {
    return this.value.split(',').map((element) => element.trim()).join(',');
  }
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

  getValueForSubmit() {
    return this.value.trim();
  }
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
