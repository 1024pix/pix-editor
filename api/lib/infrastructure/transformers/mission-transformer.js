import { logger } from '../logger.js';
import { Challenge, Skill, Mission } from '../../domain/models/index.js';

export function transform({ missions, challenges, tubes, thematics, skills }) {
  return missions.map((mission) => {
    const thematicIds = mission.thematicIds?.split(',') ?? [];
    const content = {
      dareChallenges: [],
      steps: []
    };

    thematicIds.forEach((thematicId, index) => {
      const thematic = thematics.find((thematic) => thematic.id === thematicId);

      if (!thematic) {
        logger.warn({ mission }, 'No thematic found for mission');
        return;
      }

      const missionTubes = tubes.filter((tube) => thematic?.tubeIds?.includes(tube.id));
      if (missionTubes.length === 0) {
        logger.warn({ mission }, 'No tubes found for mission');
        return;
      }

      if (index < thematicIds.length - 1) {
        content.steps.push({
          tutorialChallenges: _getChallengeIdsForActivity(mission.status, missionTubes, skills, challenges, '_di'),
          trainingChallenges: _getChallengeIdsForActivity(mission.status, missionTubes, skills, challenges, '_en'),
          validationChallenges: _getChallengeIdsForActivity(mission.status, missionTubes, skills, challenges, '_va'),
        });
      } else {
        content.dareChallenges = _getChallengeIdsForActivity(mission.status, missionTubes, skills, challenges, '_de');
      }
    });
    return { ...mission, content };
  });
}

const SCHOOL_PLAYABLE_CHALLENGE_STATUSES = [Challenge.STATUSES.VALIDE, Challenge.STATUSES.PROPOSE];
const SCHOOL_PLAYABLE_SKILL_STATUSES = [Skill.STATUSES.ACTIF, Skill.STATUSES.EN_CONSTRUCTION];

function _getChallengeIdsForActivity(missionStatus, missionTubes, skills, challenges, activityPostfix) {
  const activityTube = missionTubes.find(({ name }) => name.endsWith(activityPostfix));

  if (!activityTube) {
    logger.warn({ missionTubes }, `No tubes found for postFix ${activityPostfix} in mission tubes`);
    return [];
  }

  const activitySkills = skills
    .filter((skill) => skill.tubeId === activityTube.id)
    .filter((skill) => SCHOOL_PLAYABLE_SKILL_STATUSES.includes(skill.status.toLowerCase()))
    .sort(_byLevel);

  if (!activitySkills) {
    logger.warn({ activityTube }, 'No skills found for activityTube');
    return [];
  }

  return activitySkills.map((activitySkill) => {
    const alternatives = challenges
      .filter((challenge) => activitySkill.id === challenge.skillId)
      .filter((challenge) => SCHOOL_PLAYABLE_CHALLENGE_STATUSES.includes(challenge.status.toLowerCase()))
      .filter((challenge) => (missionStatus === Mission.status.VALIDATED && challenge.status === Challenge.STATUSES.VALIDE) || missionStatus !== Mission.status.VALIDATED);

    if (alternatives.length === 0) {
      logger.warn({ activitySkill }, 'No challenges found for activitySkill');
    }
    return alternatives.sort(_byAlternativeVersion).map(({ id }) => id);
  }).filter((activitySkills) => activitySkills.length > 0);
}

const _byLevel = (skillA, skillB) => skillA.level - skillB.level;
const _byAlternativeVersion = (challengeA, challengeB) => (challengeA.alternativeVersion ?? 0) - (challengeB.alternativeVersion ?? 0);
