import ChallengesProduction from 'pix-editor/components/challenges-production/challenges-production';
<template>
  <ChallengesProduction
    @skill={{@controller.model.skill}}
    @challenges={{@controller.model.challenges}}
    @overview={{@controller.model.overview}}
    @competenceId={{@controller.model.competenceId}}
    @canExpand={{true}}
  />
</template>
