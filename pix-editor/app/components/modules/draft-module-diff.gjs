import PixLabel from '@1024pix/pix-ui/components/pix-label';
import { htmlSafe } from '@ember/template';
import t from 'ember-intl/helpers/t';

<template>
  <div class="module__data-field">
    <PixLabel>
      {{t "modules.draft-module.diff.label"}}
    </PixLabel>
    <div class="draft-module-diff">
      {{htmlSafe @htmlDiff}}
    </div>
  </div>
</template>
