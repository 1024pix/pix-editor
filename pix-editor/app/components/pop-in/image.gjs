import PixModal from '@1024pix/pix-ui/components/pix-modal';
<template><PixModal @title="Illustration" @onCloseButtonClick={{@close}} @showModal={{@showModal}} ...attributes>
  <:content>
    <img class="image-modal" src={{@imageSrc}} alt="illustration">
  </:content>
</PixModal>
</template>
