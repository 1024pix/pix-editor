import ChallengeView from 'pixeditor/components/challenge-view/challenge-view';

<template>
  <ChallengeView
    @challenge={{@controller.model.challenge}}
    @overview={{@controller.model.overview}}
    @competenceId={{@controller.model.competenceId}}
    @skillId={{@controller.model.skill.id}}
  />
</template>
