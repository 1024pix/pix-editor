const VALIDATED_CHALLENGE = 'validé';
const PROTOTYPE_CHALLENGE = 'Prototype 1';

function transform({ tubes, skills, challenges }) {
  return _addDeviceCompliance({ tubes, skills, challenges });
}

function _addDeviceCompliance({ tubes, skills, challenges }) {
  return tubes.map((tube) => {
    const tubeChallenges = _filterValidatedPrototypeTubeChallenges(skills, challenges, tube.id);
    tube.isMobileCompliant = tubeChallenges?.length > 0 && tubeChallenges.every(_isChallengeSmartphoneCompliant);
    tube.isTabletCompliant = tubeChallenges?.length > 0 && tubeChallenges.every(_isChallengeTabletCompliant);
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

module.exports = {
  transform,
};
