import { htmlSafe } from '@ember/template';

<template>
  <h2 class="module-internal-title">{{@internalTitle}}</h2>
  <div class="draft-module-diff">
    {{htmlSafe @htmlDiff}}
  </div>
</template>
