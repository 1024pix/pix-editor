import LocalizedChallengesProduction from 'pix-editor/components/challenges-production/localized-challenges-production';
import LocalizedChallengeView from 'pix-editor/components/localized-challenge-view/localized-challenge-view';
<template>
  <LocalizedChallengesProduction
    @skill={{@controller.model.skill}}
    @challengeLocales={{@controller.model.challengeLocales}}
    @overview={{@controller.model.overview}}
    @competence={{@controller.model.competence}}
    @canExpand={{false}}
  />
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
