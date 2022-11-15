const VALIDATED_CHALLENGE = 'validé';
const PROTOTYPE_CHALLENGE = 'Prototype 1';

function transform({ tubes, skills, challenges, thematics }) {
  return _addDeviceCompliance({ tubes, skills, challenges, thematics });
}

function _addDeviceCompliance({ tubes, skills, challenges, thematics }) {
  return tubes.map((tube) => {
    const tubeChallenges = _filterValidatedPrototypeTubeChallenges(skills, challenges, tube.id);
    tube.isMobileCompliant = tubeChallenges?.length > 0 && tubeChallenges.every(_isChallengeSmartphoneCompliant);
    tube.isTabletCompliant = tubeChallenges?.length > 0 && tubeChallenges.every(_isChallengeTabletCompliant);
    tube.thematicId = _findThematicId(tube.id, thematics);
    tube.skillIds = _findSkillIds(tube.id, skills);
    return tube;
  });
}

function _filterValidatedPrototypeTubeChallenges(skills, challenges, tubeId) {
  return challenges.filter((challenge) => {
    if (challenge.status !== VALIDATED_CHALLENGE) return false;
    if (challenge.genealogy !== PROTOTYPE_CHALLENGE) return false;
    const skill = skills.find((skill) => skill.id === challenge.skillId);
    return skill?.tubeId === tubeId;
  });
}

function _isChallengeSmartphoneCompliant(challenge) {
  return challenge.responsive?.includes('Smartphone');
}

function _isChallengeTabletCompliant(challenge) {
  return challenge.responsive?.includes('Tablet');
}

function _findThematicId(tubeId, thematics) {
  const correspondingThematic = thematics.find((thematic) => thematic.tubeIds.includes(tubeId));
  return correspondingThematic.id;
}

function _findSkillIds(tubeId, skills) {
  return skills.filter((skill) => skill.tubeId === tubeId).map((skill) => skill.id);
}

module.exports = {
  transform,
};
