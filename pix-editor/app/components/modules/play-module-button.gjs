import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import t from 'ember-intl/helpers/t';

<template>
  <PixButtonLink
    @href={{if @isPreview @module.previewUrl @module.url}}
    target="_blank"
    @variant="secondary"
    @iconAfter="openNew"
  >
    {{#if @isPreview}}
      {{t "modules.components.play-module-button.preview"}}
    {{else}}
      {{if
        @module.isDraft
        (t "modules.components.play-module-button.play-draft")
        (t "modules.components.play-module-button.play-module")
      }}
    {{/if}}
  </PixButtonLink>
</template>
