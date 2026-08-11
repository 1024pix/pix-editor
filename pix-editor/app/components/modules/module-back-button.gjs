import PixButton from '@1024pix/pix-ui/components/pix-button';
import t from 'ember-intl/helpers/t';

function back() {
  return window.history.back();
}

<template>
  <PixButton @triggerAction={{back}}>{{t "modules.components.module-back-button.back"}}</PixButton>
</template>
