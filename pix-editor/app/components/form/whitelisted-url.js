import { A } from '@ember/array';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class WhitelistedUrlForm extends Component {
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
    if (this.args.initialComment.length > 0) {
      this.comment.setValue(this.args.initialComment);
      this.comment.validate();
    }
    if (this.args.initialRelatedSkillNames.length > 0) {
      this.relatedSkillNames.setValue(this.args.relatedSkillNames);
      this.relatedSkillNames.validate();
    }
    if (this.args.initialCheckType.length > 0) {
      this.checkType.setValue(this.args.initialCheckType);
      this.checkType.validate();
    } else {
      this.checkType.setValue(this.checkTypeOptions[0].value);
      this.checkType.validate();
    }
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
      this.errorMessages.pushObjects(err.message.split('\n'));
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  updateUrl(event) {
    this.url.setValue(event.target.value);
    this.validateUrl();
  }

  @action
  validateUrl() {
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
    this.validateRelatedSkillNames();
  }

  @action
  validateRelatedSkillNames() {
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
    this.isFormInvalid = !this.url.isValid || !this.relatedSkillNames.isValid || !this.checkType.isValid;
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

  validate() { throw new Error('implement me');}

  getValueForSubmit() { throw new Error('implement me');}
}

class UrlField extends FormField {
  constructor() {
    super();
  }

  validate() {
    if (this.value.trim().length > 0) {
      this.state = FormField.STATES.SUCCESS;
      this.errorMessage = '';
    } else {
      this.state = FormField.STATES.ERROR;
      this.errorMessage = 'L\'URL est obligatoire';
    }
  }

  getValueForSubmit() { return this.value.trim(); }
}

class CommentField extends FormField {
  validate() { this.state = FormField.STATES.SUCCESS; }

  getValueForSubmit() { return this.value.trim(); }
}

class RelatedSkillNamesField extends FormField {
  constructor() {
    super();
  }

  validate() {
    const relatedSkillNames = this.getValueForSubmit().split(',');
    const hasAnyEmptyNames = relatedSkillNames.some((name) => name.trim().length === 0);
    if (relatedSkillNames.length > 1 && hasAnyEmptyNames) {
      console.log('aaa', this.value, relatedSkillNames, hasAnyEmptyNames);
      this.state = FormField.STATES.ERROR;
      this.errorMessage = 'Les noms d\'acquis doivent être séparés par des virgules et ne peuvent pas être vides.';
    } else {
      this.state = FormField.STATES.SUCCESS;
      this.errorMessage = '';
    }
  }

  getValueForSubmit() {
    return this.value.trim().split(',').map((name) => name.trim()).join(',');
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
