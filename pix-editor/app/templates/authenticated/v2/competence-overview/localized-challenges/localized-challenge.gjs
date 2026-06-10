import LocalizedChallengeView from 'pixeditor/components/localized-challenge-view/localized-challenge-view';
<template>
  <LocalizedChallengeView
    @challengeLocale={{@controller.model.challengeLocale}}
    @localizedChallenge={{@controller.model.localizedChallenge}}
    @competence={{@controller.model.competence}}
    @overview={{@controller.model.overview}}
    @skillId={{@controller.model.skill.id}}
    @edition={{@controller.edition}}
    @edit={{@controller.edit}}
    @cancelEdit={{@controller.cancelEdit}}
  />
</template>
