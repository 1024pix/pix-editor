import Alternatives from 'pixeditor/components/alternatives';
<template>
  {{#if @controller.competenceController.mainRightSlot}}
    {{#in-element @controller.competenceController.mainRightSlot}}
      <Alternatives
        @challenge={{@controller.model}}
        @maximizeRight={{@controller.maximizeRight}}
        @mayCreateAlternative={{@controller.mayCreateAlternative}}
        @newAlternative={{@controller.newAlternative}}
        @rightMaximized={{@controller.rightMaximized}}
        @size={{@controller.size}}
      />
      {{outlet}}
    {{/in-element}}
  {{/if}}
</template>
