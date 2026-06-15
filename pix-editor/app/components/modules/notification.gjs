import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';

<template>
  <PixNotificationAlert @type="info" @withIcon={{true}} class="module-form-notification">
    Ce module en draft est issue d'un module en production.
    <PixButtonLink @route="authenticated.modules.production-module" @model={{@moduleId}} @variant="secondary">
      Voir le détail du module en prod
    </PixButtonLink>
  </PixNotificationAlert>
</template>
