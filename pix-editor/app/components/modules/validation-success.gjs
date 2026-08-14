import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import t from 'ember-intl/helpers/t';
import PublishModuleButton from 'pixeditor/components/modules/publish-module-button';

<template>
  <PixNotificationAlert @type="success" @withIcon={{true}} class="module-validation-success">
    <span class="module-validation-success__information">
      <span class="module-validation-success-information--bold">{{t
          "modules.components.validation-success.title"
        }}</span>
      {{t "modules.components.validation-success.subtitle"}}
    </span>
    <PublishModuleButton @draftModule={{@draftModule}} />
  </PixNotificationAlert>
</template>
