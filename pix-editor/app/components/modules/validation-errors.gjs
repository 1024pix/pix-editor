import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import Component from '@glimmer/component';

export default class ModuleValidationErrors extends Component {
  get formattedTag() {
    const numberOfErrors = this.args.validationErrors.length;
    return `${numberOfErrors} erreur${numberOfErrors > 1 ? 's' : ''}`;
  }

  <template>
    <PixAccordions
      @iconName="error"
      @isV2Version={{true}}
      @tagContent={{this.formattedTag}}
      @tagColor="error"
      class="module-validation-errors"
    >
      <:title>Erreurs de validation</:title>
      <:content>
        <ul>
          {{#each @validationErrors as |validationError|}}
            <li class="module-validation-errors__notification">
              <PixNotificationAlert @withIcon={{true}} @type="error">
                {{validationError}}
              </PixNotificationAlert>
            </li>
          {{/each}}
        </ul>
      </:content>
    </PixAccordions>
  </template>
}
