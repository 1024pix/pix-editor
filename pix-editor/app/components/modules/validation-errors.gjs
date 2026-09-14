import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

export default class ModuleValidationErrors extends Component {
  @service intl;

  @tracked isOpen = false;

  get errors() {
    const editorErrors = (this.args.editorErrors ?? []).map((error) => ({ line: error.line, message: error.message }));
    const validationErrors = (this.args.validationErrors ?? []).map((error) => ({ message: error.message }));
    return [...validationErrors, ...editorErrors];
  }

  get totalErrorsCount() {
    return this.errors.length;
  }

  @action
  handleToggle(event) {
    this.isOpen = event.target.open;
  }

  get buttonInformation() {
    return this.isOpen
      ? {
          label: this.intl.t('modules.components.validation-errors.collapse'),
          icon: 'chevronTop',
        }
      : {
          label: this.intl.t('modules.components.validation-errors.expand', {
            count: this.totalErrorsCount,
          }),
          icon: 'chevronBottom',
        };
  }

  <template>
    <details class="module-validation-errors" {{on "toggle" this.handleToggle}}>
      <summary class="module-validation-errors__button" aria-expanded={{if this.isOpen "true" "false"}}>
        <span class="module-validation-errors-button__title-container">
          <PixIcon @ariaHidden={{true}} @name="error" @plainIcon={{true}} />
          <span class="module-validation-errors-button__title">
            <span>{{t "modules.components.validation-errors.title" count=this.totalErrorsCount}}</span>
            {{#if @isEditPage}}
              <span>{{t "modules.components.validation-errors.information-edit-page"}}</span>
            {{else}}
              <span>{{t "modules.components.validation-errors.information"}}</span>
            {{/if}}
          </span>
        </span>

        <span class="module-validation-errors__toggle-label">
          {{this.buttonInformation.label}}
          <PixIcon @ariaHidden={{true}} @name="{{this.buttonInformation.icon}}" />
        </span>
      </summary>

      {{#if this.errors.length}}
        <ul class="module-validation-errors__content">
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
    </details>
  </template>
}
