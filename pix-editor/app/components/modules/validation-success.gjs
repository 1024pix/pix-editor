import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import PublishModuleButton from 'pixeditor/components/modules/publish-module-button';

export default class ModuleValidationSuccess extends Component {
  @service access;

  get mayDisplayPublishButton() {
    return this.access.mayCreateOrEditModule();
  }

  <template>
    <PixNotificationAlert @type="success" @withIcon={{true}} class="module-validation-success">
      <span class="module-validation-success__information">
        <span class="module-validation-success-information--bold">{{t
            "modules.components.validation-success.title"
          }}</span>
        {{t "modules.components.validation-success.subtitle"}}
      </span>
      {{#if this.mayDisplayPublishButton}}
        <PublishModuleButton @draftModule={{@draftModule}} />
      {{/if}}
    </PixNotificationAlert>
  </template>
}
