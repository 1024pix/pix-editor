import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { A } from '@ember/array';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Card from 'pixeditor/components/card';

export default class StaticCourseForm extends Component {
  <template>
    <form {{on "submit" this.onSubmitClicked}} class="form">
      <Card class="new-static-course-form-field" @title="1. Renseigner les informations">
        <PixInput
          @id="static-course-name"
          @errorMessage="{{this.name.errorMessage}}"
          @requiredLabel="{{this.name.errorMessage}}"
          @validationStatus={{this.name.state}}
          @value={{@initialName}}
          {{on "keyup" this.updateName}}
          {{on "focusout" this.validateName}}
        ><:label>Nom du test statique</:label></PixInput>
        <PixTextarea
          @id="static-course-description"
          @size="small"
          @maxlength="1000"
          rows="5"
          @value={{@initialDescription}}
          {{on "keyup" this.updateDescription}}
        ><:label>Description à usage interne</:label></PixTextarea>
        <div class="static-course-tag__area">
          <PixMultiSelect
            @id="tags-selector"
            @placeholder="Sélectionnez des tags"
            @values={{this.selectedTagIds}}
            @onChange={{this.onTagClicked}}
            @isSearchable="true"
            @emptyMessage="Pas de résultats"
            @options={{this.tagOptions}}
          >
            <:label>Tags</:label>
            <:default as |option|>{{option.label}}</:default>
          </PixMultiSelect>
          <div class="static-course-chips">
            {{#each this.selectedTags as |tag|}}
              <PixTag class="static-course-tag" @color="yellow">
                {{tag.label}}
              </PixTag>
            {{/each}}
          </div>
        </div>
      </Card>
      <Card class="new-static-course-form-card" @title="2. Sélectionner les épreuves">
        <span>
          Veuillez renseigner les IDs que vous souhaitez ajouter à votre test statique, une par ligne dans l'ordre
          souhaité. Le premier ID renseigné correspondra à l'ID de la première épreuve du test statique.
        </span>
        <PixTextarea
          @id="static-course-challenges"
          @size="small"
          @maxlength="1000"
          rows="20"
          @value={{@initialChallengeIds}}
          @errorMessage="{{if this.challengeIds.isError this.challengeIds.errorMessage ''}}"
          {{on "keyup" this.updateChallengeIds}}
          {{on "focusout" this.validateChallengeIds}}
        ><:label>IDs des épreuves</:label></PixTextarea>
      </Card>
      <div class="form-error">
        {{#each this.errorMessages as |errorMessage|}}
          {{errorMessage}}<br />
        {{/each}}
      </div>
      <div class="page-actions">
        <PixButton @backgroundColor="transparent-light" @isBorderVisible={{true}} @triggerAction={{@onFormCancelled}}>
          {{@cancelButtonText}}
        </PixButton>
        <PixButton
          @backgroundColor="blue"
          @type="submit"
          @isDisabled={{this.isFormInvalid}}
          @isLoading={{this.isSubmitting}}
        >
          {{@submitButtonText}}
        </PixButton>
      </div>
    </form>
  </template>

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
    for (const tag of [...this.args.staticCourseTags]) {
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
    this.selectedTags = [...this.args.staticCourseTags]
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

  validate() {
    throw new Error('implement me');
  }

  getValueForSubmit() {
    throw new Error('implement me');
  }
}

class NameField extends FormField {
  constructor() {
    super({ errorMessage: 'Le nom est obligatoire' });
  }

  validate() {
    this.state = this.value.trim().length > 0 ? STATES.SUCCESS : STATES.ERROR;
  }

  getValueForSubmit() {
    return this.value.trim();
  }
}

class DescriptionField extends FormField {
  validate() {
    return STATES.SUCCESS;
  }

  getValueForSubmit() {
    return this.value.trim();
  }
}

class ChallengeIdsField extends FormField {
  constructor() {
    super({
      errorMessage:
        "La présence d'épreuves est obligatoire. Renseignez le champ en séparant chaque ID d'épreuve par un retour à la ligne",
    });
  }

  validate() {
    this.state = this.value.trim().length > 0 ? STATES.SUCCESS : STATES.ERROR;
  }

  getValueForSubmit() {
    const challengeIds = this.value.trim().split(/\r?\n|\r|\n/g);
    return challengeIds.map((challengeId) => challengeId.trim()).filter((challengeId) => challengeId.length > 0);
  }
}
