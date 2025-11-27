import LocalizedChallengesProduction from 'pixeditor/components/challenges-production/localized-challenges-production';
<template><LocalizedChallengesProduction @skill={{@controller.model.skill}} @challengeLocales={{@controller.model.challengeLocales}} @overview={{@controller.model.overview}} @competence={{@controller.model.competence}} @canExpand={{true}} />
</template>
