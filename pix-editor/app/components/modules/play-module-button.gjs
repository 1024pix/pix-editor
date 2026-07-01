import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';

<template>
  <PixButtonLink
    @href={{if @isPreview @module.previewUrl @module.url}}
    target="_blank"
    @variant="secondary"
    @iconAfter="openNew"
  >
    {{#if @isPreview}}
      Prévisualiser
    {{else}}
      {{if @module.isDraft "Jouer le draft" "Jouer le module"}}
    {{/if}}
  </PixButtonLink>
</template>
