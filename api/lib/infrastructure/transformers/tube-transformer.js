const VALIDATED_CHALLENGE = 'validé';
const PROTOTYPE_CHALLENGE = 'Prototype 1';

function transform({ tubes, skills, challenges, thematics }) {
  tubes.forEach((tube) => {
    _addLinks({ tube, skills, thematics });
    _addDeviceCompliance({ tube, skills, challenges });
  });
  return tubes;
}

function _addLinks({ tube, skills, thematics }) {
  tube.thematicId = _findThematicId(tube.id, thematics);
  tube.skillIds = _findSkillIds(tube.id, skills);
}

function _findThematicId(tubeId, thematics) {
  const correspondingThematic = thematics.find((thematic) => thematic.tubeIds?.includes(tubeId));
  return correspondingThematic?.id || null;
}

function _findSkillIds(tubeId, skills) {
  return skills.filter((skill) => skill.tubeId === tubeId).map((skill) => skill.id);
}

function _addDeviceCompliance({ tube, skills, challenges }) {
  const tubeChallenges = _filterValidatedPrototypeTubeChallenges(skills, challenges, tube.id);
  tube.isMobileCompliant = tubeChallenges?.length > 0 && tubeChallenges.every(_isChallengeSmartphoneCompliant);
  tube.isTabletCompliant = tubeChallenges?.length > 0 && tubeChallenges.every(_isChallengeTabletCompliant);
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

module.exports = {
  transform,
};
