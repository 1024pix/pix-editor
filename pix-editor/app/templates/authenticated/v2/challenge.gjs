import ChallengesProduction from 'pixeditor/components/challenges-production/challenges-production';
import ChallengeView from 'pixeditor/components/challenge-view/challenge-view';
<template><ChallengesProduction @skill={{@controller.model.skill}} @challenges={{@controller.model.challenges}} @overview={{@controller.model.overview}} @competenceId={{@controller.model.competenceId}} @canExpand={{false}} />
<ChallengeView @challenge={{@controller.model.challenge}} @overview={{@controller.model.overview}} @competenceId={{@controller.model.competenceId}} @skillId={{@controller.model.skill.id}} />
</template>
