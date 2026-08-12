import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

const NOTIFICATION_STATES = {
  DRAFT: {
    color: 'warning',
    informationKey: 'modules.components.module-notification.draft-information',
    redirectionButtonLabelKey: 'modules.components.module-notification.draft-redirection',
    route: 'authenticated.modules.production-module',
  },
  PRODUCTION: {
    color: 'info',
    informationKey: 'modules.components.module-notification.production-information',
    redirectionButtonLabelKey: 'modules.components.module-notification.production-redirection',
    route: 'authenticated.modules.draft-module',
  },
};

export default class ModuleNotification extends Component {
  get showNotification() {
    const { module } = this.args;
    if (module.isDraft) {
      return module.isEditionDraft;
    }
    return module.hasDraft;
  }

  get notificationState() {
    return this.args.module.isDraft ? NOTIFICATION_STATES.DRAFT : NOTIFICATION_STATES.PRODUCTION;
  }

  get moduleId() {
    const { module } = this.args;
    return module.isDraft ? module.moduleId : module.draftModuleId;
  }

  <template>
    {{#if this.showNotification}}
      <PixNotificationAlert
        @type={{this.notificationState.color}}
        class="module-form-notification--{{this.notificationState.color}}"
      >
        {{t this.notificationState.informationKey}}
        <PixButtonLink @route={{this.notificationState.route}} @model={{this.moduleId}} @variant="secondary">
          {{t this.notificationState.redirectionButtonLabelKey}}
        </PixButtonLink>
      </PixNotificationAlert>
    {{/if}}
  </template>
}
