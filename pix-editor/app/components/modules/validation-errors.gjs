import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class ModuleValidationErrors extends Component {
  @service intl;

  get formattedTag() {
    return this.intl.t('modules.components.validation-errors.error-count', {
      count: this.args.validationErrors.length,
    });
  }

  <template>
    <PixAccordions
      @iconName="error"
      @isV2Version={{true}}
      @tagContent={{this.formattedTag}}
      @tagColor="error"
      class="module-validation-errors"
    >
      <:title>{{t "modules.components.validation-errors.title"}}</:title>
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
