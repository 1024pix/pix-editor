import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

export default class ModuleValidationErrors extends Component {
  @service intl;

  @tracked isCollapsed = true;
  @tracked hasUnCollapsedOnce = false;

  get isUnCollapsed() {
    return !this.isCollapsed;
  }

  get isContentRendered() {
    return this.hasUnCollapsedOnce;
  }

  get errors() {
    const editorErrors = (this.args.editorErrors ?? []).map((error) => ({ line: error.line, message: error.message }));
    const validationErrors = (this.args.validationErrors ?? []).map((error) => ({ message: error.message }));
    return [...validationErrors, ...editorErrors];
  }

  get totalErrorsCount() {
    return this.errors.length;
  }

  @action
  toggleAccordions() {
    this.isCollapsed = !this.isCollapsed;
    this.hasUnCollapsedOnce = true;
  }

  get buttonInformation() {
    return this.isUnCollapsed
      ? {
          label: this.intl.t('modules.components.validation-errors.collapse'),
          icon: 'chevronTop',
        }
      : {
          label: this.intl.t('modules.components.validation-errors.expand', {
            count: this.args.validationErrors.length,
          }),
          icon: 'chevronBottom',
        };
  }

  <template>
    <div class="module-validation-errors">
      <button
        type="button"
        class="module-validation-errors__button"
        {{on "click" this.toggleAccordions}}
        aria-controls="validation-errors-accordion"
        aria-expanded={{if this.isUnCollapsed "true" "false"}}
      >
        <div class="module-validation-errors-button__title-container">
          <PixIcon @ariaHidden={{true}} @name="error" @plainIcon={{true}} />
          <div class="module-validation-errors-button__title">
            <p>{{t "modules.components.validation-errors.title" count=this.totalErrorsCount}}</p>
            {{#if @isEditPage}}
              <p>{{t "modules.components.validation-errors.information-edit-page"}}</p>
            {{else}}
              <p>{{t "modules.components.validation-errors.information"}}</p>
            {{/if}}
          </div>
        </div>

        <span class="module-validation-errors__toggle-label">
          {{this.buttonInformation.label}}
          <PixIcon @ariaHidden={{true}} @name="{{this.buttonInformation.icon}}" />
        </span>
      </button>

      <div
        id="validation-errors-accordion"
        aria-hidden={{if this.isCollapsed "true" "false"}}
        class="module-validation-errors__content"
      >
        {{#if this.errors.length}}
          <ul>
            {{#each this.errors as |error|}}
              <li class="module-validation-errors__item">
                {{#if error.line}}
                  <span class="module-validation-errors__item-line">{{t
                      "modules.components.validation-errors.editor-error-line"
                      line=error.line
                    }}</span>
                {{/if}}
                {{error.message}}
              </li>
            {{/each}}
          </ul>
        {{/if}}
      </div>
    </div>
  </template>
}
