import { PixModal } from '@1024pix/nebulix-ember';
<template>
  <PixModal
    @title="Illustration"
    @onCloseButtonClick={{@close}}
    @showModal={{@showModal}}
    @variant="orga"
    ...attributes
  >
    <:content>
      <img class="image-modal" src={{@imageSrc}} alt="illustration" />
    </:content>
  </PixModal>
</template>
