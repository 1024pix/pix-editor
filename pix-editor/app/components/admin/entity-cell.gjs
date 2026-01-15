import Component from '@glimmer/component';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AdminEntityCell extends Component {
  @tracked isDisplayed = false;

  get value() {
    return this.args.row.properties[this.args.field.key];
  }

  get optionLabel() {
    return this.args.field?.options.find((option) => option.value === this.value)?.label;
  }

  get isEnum() {
    return this.args.field.type === 'enum';
  }

  get isSecret() {
    return this.args.field.type === 'secret';
  }

  get secretFieldVisibilityClass() {
    return this.isDisplayed ? '' : 'secret-container__secret--blurred';
  }

  get secretFieldToggleIcon() {
    return this.isDisplayed ? 'eyeOff' : 'eye';
  }

  get secretFieldToggleAriaLabel() {
    return this.isDisplayed
      ? `Cacher le secret "${this.args.field.label}" de l'entité "${this.args.row.id}"`
      : `Afficher le secret "${this.args.field.label}" de l'entité "${this.args.row.id}"`;
  }

  get redactedValue() {
    return '*'.repeat(this.value.length);
  }

  @action
  toggleFieldVisibility() {
    this.isDisplayed = !this.isDisplayed;
  }

  <template>
    {{#if this.isEnum}}
      <PixTag>
        {{this.optionLabel}}
      </PixTag>
    {{else if this.isSecret}}
      <span class="secret-container">
        <span class="secret-container__secret {{this.secretFieldVisibilityClass}}" aria-live="polite">
          {{#if this.isDisplayed}}
            {{this.value}}
          {{else}}
            <span aria-hidden="true">
              {{this.redactedValue}}
            </span>
            <span class="sr-only">
              Valeur cachée
            </span>
          {{/if}}
        </span>
        <PixIconButton
          @ariaLabel="{{this.secretFieldToggleAriaLabel}}"
          @iconName="{{this.secretFieldToggleIcon}}"
          @triggerAction={{this.toggleFieldVisibility}}
          @size="small"
        />
      </span>
    {{else}}
      {{this.value}}
    {{/if}}
  </template>
}
