import Loader from 'pixeditor/components/loader';
<template>{{#if @controller.competenceController.mainRightSlot}}
  {{#in-element @controller.competenceController.mainRightSlot}}
    <div class="main-right__loader">
      <Loader />
    </div>
  {{/in-element}}
{{/if}}</template>
