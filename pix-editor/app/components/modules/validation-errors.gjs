import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

export default class ModuleValidationErrors extends Component {
  @tracked isCollapsed = true;
  @tracked hasUnCollapsedOnce = false;

  get isUnCollapsed() {
    return !this.isCollapsed;
  }

  get isContentRendered() {
    return this.hasUnCollapsedOnce;
  }

  get totalErrorsCount() {
    return (this.args.validationErrors?.length ?? 0) + (this.args.editorErrors?.length ?? 0);
  }

  @action
  toggleAccordions() {
    this.isCollapsed = !this.isCollapsed;
    this.hasUnCollapsedOnce = true;
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
          {{#if this.isUnCollapsed}}
            {{t "modules.components.validation-errors.collapse"}}
          {{else}}
            {{t "modules.components.validation-errors.expand" count=this.totalErrorsCount}}
          {{/if}}
        </span>
      </button>

      <div
        id="validation-errors-accordion"
        aria-hidden={{if this.isCollapsed "true" "false"}}
        class="module-validation-errors__content"
      >
        {{#if @editorErrors.length}}
          <p class="module-validation-errors__subtitle">{{t
              "modules.components.validation-errors.editor-errors-title"
            }}</p>
          <ul>
            {{#each @editorErrors as |editorError|}}
              <li class="module-validation-errors__item">
                <span class="module-validation-errors__item-line">{{t
                    "modules.components.validation-errors.editor-error-line"
                    line=editorError.line
                  }}</span>
                {{editorError.message}}
              </li>
            {{/each}}
          </ul>
        {{/if}}
        {{#if @validationErrors.length}}
          <ul>
            <p class="module-validation-errors__subtitle">{{t
                "modules.components.validation-errors.api-errors-title"
              }}</p>
            {{#each @validationErrors as |validationError|}}
              <li class="module-validation-errors__item">
                {{validationError}}
              </li>
            {{/each}}
          </ul>
        {{/if}}
      </div>
    </div>
  </template>
}
