function addCompliance({ tubes, skills, challenges }) {
  return tubes.map((tube) => {
    const tubeChallenges = _filterTubeChallenges(skills, challenges, tube.id);
    tube.isMobileCompliant = tubeChallenges?.length > 0 && tubeChallenges.every(_isChallengeCompliantSmartphone);
    tube.isTabletCompliant = tubeChallenges?.length > 0 && tubeChallenges.every(_isChallengeCompliantTablet);
    return tube;
  });
}

function _filterTubeChallenges(skills, challenges, tubeId) {
  return challenges.filter((challenge) => {
    const skill = skills.find((skill) => skill.id === challenge.skillId);
    return skill?.tubeId === tubeId;
  });
}

function _isChallengeCompliantSmartphone(challenge) {
  return challenge.responsive?.includes('Smartphone');
}

function _isChallengeCompliantTablet(challenge) {
  return challenge.responsive?.includes('Tablet');
}

module.exports = {
  addCompliance,
};
