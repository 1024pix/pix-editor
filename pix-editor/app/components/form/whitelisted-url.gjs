import { A } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import Card from 'pix-editor/components/card';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import PixButton from '@1024pix/pix-ui/components/pix-button';

export default class WhitelistedUrlForm extends Component {
  <template>
    <form {{on "submit" this.onSubmitClicked}} class="form">
      <Card class="new-whitelisted-url-form-field" @title="1. Détails de l'URL">
        <div class="new-whitelisted-url-details">
          <PixSelect
            @id="whitelisted-url-check-type"
            @errorMessage={{this.checkType.errorMessage}}
            @requiredLabel={{this.checkType.errorMessage}}
            @validationStatus={{this.checkType.state}}
            @value={{this.checkType.value}}
            @options={{this.checkTypeOptions}}
            @hideDefaultOption={{true}}
            @onChange={{this.updateCheckType}}
          >
            <:label>Type de comparaison d'URL</:label>
          </PixSelect>
          <PixInput
            @id="whitelisted-url-link"
            @errorMessage={{this.url.errorMessage}}
            @requiredLabel={{this.url.errorMessage}}
            @validationStatus={{this.url.state}}
            @value={{this.url.value}}
            placeholder="https://example.org"
            {{on "input" this.updateUrl}}
          >
            <:label>URL à ne pas analyser</:label>
          </PixInput>
        </div>
      </Card>
      <Card class="new-whitelisted-url-form-field" @title="2. Informations additionnelles">
        <PixInput
          @id="whitelisted-url-related-skill-names"
          @errorMessage={{this.relatedSkillNames.errorMessage}}
          @validationStatus={{this.relatedSkillNames.state}}
          @value={{this.relatedSkillNames.value}}
          placeholder="@exemple1,@test3, ..."
          {{on "input" this.updateRelatedSkillNames}}
        >
          <:label>Nom des acquis concernés, séparés par des virgules</:label>
        </PixInput>
        <PixTextarea
          @id="whitelisted-url-comment"
          @maxlength="1024"
          rows="5"
          @value={{this.comment.value}}
          {{on "input" this.updateComment}}
        >
          <:label>Commentaire</:label>
        </PixTextarea>
      </Card>
      <div class="form-error">
        {{#each this.errorMessages as |errorMessage|}}
          {{errorMessage}}<br />
        {{/each}}
      </div>
      <div class="page-actions">
        <PixButton
          @variant="secondary"
          @backgroundColor="transparent-light"
          @isBorderVisible={{true}}
          @triggerAction={{@onFormCancelled}}
        >
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

  @tracked url = new UrlField();
  @tracked comment = new CommentField();
  @tracked relatedSkillNames = new RelatedSkillNamesField();
  @tracked checkType = new CheckTypeField();
  @tracked isFormInvalid = true;
  @tracked isSubmitting = false;
  @tracked errorMessages = A([]);

  checkTypeOptions = [
    {
      value: 'exact_match',
      label: 'Strictement égale à',
    },
    {
      value: 'starts_with',
      label: 'Commence par',
    },
  ];

  constructor(...args) {
    super(...args);

    if (this.args.initialUrl.length > 0) {
      this.url.setValue(this.args.initialUrl);
      this.url.validate();
    }
    if (this.args.initialComment?.length > 0) {
      this.comment.setValue(this.args.initialComment);
      this.comment.validate();
    }
    if (this.args.initialRelatedSkillNames?.length > 0) {
      this.relatedSkillNames.setValue(this.args.initialRelatedSkillNames);
      this.relatedSkillNames.validate();
    }
    if (this.args.initialCheckType.length > 0) {
      this.checkType.setValue(this.args.initialCheckType);
    } else {
      this.checkType.setValue(this.checkTypeOptions[0].value);
    }
    this.checkType.validate();
    this.checkFormValidity();
  }

  @action
  async onSubmitClicked(event) {
    event.preventDefault();
    this.errorMessages.length = 0;
    this.isSubmitting = true;
    const formData = {
      url: this.url.getValueForSubmit(),
      comment: this.comment.getValueForSubmit(),
      relatedSkillNames: this.relatedSkillNames.getValueForSubmit(),
      checkType: this.checkType.getValueForSubmit(),
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
  updateUrl(event) {
    this.url.setValue(event.target.value);
    this.url.validate();
    this.checkFormValidity();
  }

  @action
  updateComment(event) {
    this.comment.setValue(event.target.value);
    this.comment.validate();
    this.checkFormValidity();
  }

  @action
  updateRelatedSkillNames(event) {
    this.relatedSkillNames.setValue(event.target.value);
    this.relatedSkillNames.validate();
    this.checkFormValidity();
  }

  @action
  updateCheckType(value) {
    this.checkType.setValue(value);
    this.checkType.validate();
    this.checkFormValidity();
  }

  checkFormValidity() {
    this.isFormInvalid =
      !this.url.isValid || !this.relatedSkillNames.isValid || !this.checkType.isValid || !this.comment.isValid;
  }
}

class FormField {
  static STATES = {
    DEFAULT: 'default',
    SUCCESS: 'success',
    ERROR: 'error',
  };

  @tracked state;
  @tracked value;
  @tracked errorMessage;

  constructor({ state = FormField.STATES.DEFAULT, value = '', errorMessage = '' } = {}) {
    this.state = state;
    this.value = value;
    this.errorMessage = errorMessage;
  }

  get isError() {
    return this.state === FormField.STATES.ERROR;
  }

  get isValid() {
    return this.state === FormField.STATES.SUCCESS;
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

class UrlField extends FormField {
  constructor() {
    super();
  }

  validate() {
    if (this.value.trim().length > 0) {
      try {
        new URL(this.value);
        this.state = FormField.STATES.SUCCESS;
        this.errorMessage = '';
      } catch {
        this.state = FormField.STATES.ERROR;
        this.errorMessage = "L'URL n'est pas valide";
      }
    } else {
      this.state = FormField.STATES.ERROR;
      this.errorMessage = "L'URL est obligatoire";
    }
  }

  getValueForSubmit() {
    return this.value.trim();
  }
}

class CommentField extends FormField {
  get isValid() {
    return true;
  }

  validate() {
    this.state = FormField.STATES.SUCCESS;
  }

  getValueForSubmit() {
    return this.value.trim();
  }
}

class RelatedSkillNamesField extends FormField {
  constructor() {
    super();
  }

  get isValid() {
    return this.state === FormField.STATES.SUCCESS || this.state === FormField.STATES.DEFAULT;
  }

  validate() {
    const relatedSkillNames = this.getValueForSubmit();

    if (relatedSkillNames.length === 0) {
      this.state = FormField.STATES.DEFAULT;
      this.errorMessage = '';
      return;
    }

    const hasAnyMalformedNames = relatedSkillNames
      .split(',')
      .filter((name) => name !== '')
      .some((name) => !name.match(/^@\p{L}+\d$/u));
    if (hasAnyMalformedNames) {
      this.state = FormField.STATES.ERROR;
      this.errorMessage = "Les noms d'acquis doivent être séparés par des virgules et ne peuvent pas être vides.";
      return;
    }

    this.state = FormField.STATES.SUCCESS;
    this.errorMessage = '';
  }

  getValueForSubmit() {
    return this.value
      .trim()
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name !== '')
      .join(',');
  }
}

class CheckTypeField extends FormField {
  static OPTIONS = ['starts_with', 'exact_match'];

  constructor() {
    super();
  }

  validate() {
    if (CheckTypeField.OPTIONS.includes(this.value)) {
      this.state = FormField.STATES.SUCCESS;
      this.errorMessage = '';
    } else {
      this.state = FormField.STATES.ERROR;
      this.errorMessage = 'Type de comparaison non reconnu';
    }
  }

  getValueForSubmit() {
    return this.value;
  }
}
