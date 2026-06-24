import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';

<template>
  <PixButtonLink @href={{@module.url}} target="_blank" @variant="secondary">
    Jouer le draft
  </PixButtonLink>
  <PixButtonLink @href={{@module.previewUrl}} target="_blank" @variant="secondary">
    Prévisualiser
  </PixButtonLink>
</template>
