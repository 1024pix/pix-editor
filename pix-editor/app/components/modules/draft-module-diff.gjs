import { htmlSafe } from '@ember/template';
import Notification from 'pixeditor/components/modules/notification';

<template>
  <h2 class="module-internal-title">{{@draftModule.internalTitle}}</h2>

  <Notification @moduleId={{@draftModule.moduleId}} />
  <div class="draft-module-diff">
    {{htmlSafe @htmlDiff}}
  </div>
</template>
