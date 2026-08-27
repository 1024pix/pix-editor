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
            <p>{{t "modules.components.validation-errors.title" count=@validationErrors.length}}</p>
            <p>{{t "modules.components.validation-errors.information"}}</p>
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
        <ul>
          {{#each @validationErrors as |validationError|}}
            <li class="module-validation-errors__item">
              {{validationError}}
            </li>
          {{/each}}
        </ul>
      </div>
    </div>
  </template>
}
