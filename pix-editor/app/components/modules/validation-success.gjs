import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import t from 'ember-intl/helpers/t';
import PublishModuleButton from 'pixeditor/components/modules/publish-module-button';

<template>
  <PixNotificationAlert @type="success" @withIcon={{true}} class="module-validation-success">{{t
      "modules.components.validation-success.content"
    }}
    <PublishModuleButton @draftModule={{@draftModule}} />
  </PixNotificationAlert>
</template>
