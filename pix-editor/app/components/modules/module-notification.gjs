import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import Component from '@glimmer/component';

const NOTIFICATION_STATES = {
  DRAFT: {
    color: 'warning',
    information: 'Ce module possède une version disponible en production.',
    redirectionButtonLabel: 'Voir le détail du module en prod',
    route: 'authenticated.modules.production-module',
  },
  PRODUCTION: {
    color: 'info',
    information: 'Ce module possède une version en cours de modification.',
    redirectionButtonLabel: 'Voir le détail des modifications',
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
        {{this.notificationState.information}}
        <PixButtonLink @route={{this.notificationState.route}} @model={{this.moduleId}} @variant="secondary">
          {{this.notificationState.redirectionButtonLabel}}
        </PixButtonLink>
      </PixNotificationAlert>
    {{/if}}
  </template>
}
