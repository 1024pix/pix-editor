// TODO LIST
// industrialiser les utils translations pour gérer les objets du domaine
// factoriser du code entre pix-api-client et storage et faire un peu mieux (separation of concerns etc...)
// les objets du domaine devraient maintenant avoir un id (id persistant) et un airtableId (record id de airtable)
// tester les répos mieux (parce que là on a déconné)

export async function cloneSkill({
  cloneCommand,
  dependencies: {
    skillRepository,
    challengeRepository,
    tubeRepository,
    attachmentRepository,
    generateNewIdFnc,
  },
}) {
  const { tube, skillToClone } = await _checkIfCloningIsPossible({
    level: cloneCommand.level,
    tubeId: cloneCommand.tubeDestinationId,
    skillIdToClone: cloneCommand.skillIdToClone,
    tubeRepository,
    skillRepository,
  });

  const {
    skillChallenges,
    tubeSkills,
    attachments,
  } = await _fetchData({
    skillToCloneId: skillToClone.id,
    tubeId: tube.id,
    challengeRepository,
    skillRepository,
    attachmentRepository,
  });

  const {
    clonedSkill,
    clonedChallenges,
    clonedAttachments,
  } = skillToClone.cloneSkillAndChallenges({
    tubeDestination: tube,
    level: cloneCommand.level,
    skillChallenges,
    tubeSkills,
    attachments,
    generateNewIdFnc,
  });
  await skillRepository.create(clonedSkill);
  await challengeRepository.createBatch(clonedChallenges);
  // for now only persist primary attachments
  const attachmentsToPersist = clonedAttachments.filter((attachment) => attachment.challengeId === attachment.localizedChallengeId);
  await attachmentRepository.createBatch(attachmentsToPersist);
  return 'ok';
}

async function _checkIfCloningIsPossible({ level, tubeId, skillIdToClone, tubeRepository, skillRepository }) {
  if (level < 1 || level > 7) {
    throw new Error('Le niveau doit être compris entre 1 et 7');
  }
  const tube = await tubeRepository.get(tubeId);
  if (!tube) {
    throw new Error(`Le sujet d'id "${tubeId}" n'existe pas`);
  }
  const skillToClone = await skillRepository.get(skillIdToClone);
  if (!skillToClone) {
    throw new Error(`L'acquis d'id "${skillIdToClone}" n'existe pas`);
  }
  if (!skillToClone.isLive) {
    throw new Error('Impossible de cloner un acquis qui ne soit ni en construction ni actif');
  }
  return {
    tube,
    skillToClone,
  };
}

async function _fetchData({ skillToCloneId, tubeId, challengeRepository, skillRepository, attachmentRepository }) {
  const skillChallenges = await challengeRepository.listBySkillId(skillToCloneId);
  const tubeSkills = await skillRepository.listByTubeId(tubeId);
  const challengeIds = skillChallenges.map((ch) => ch.id);
  const attachments = await attachmentRepository.listByChallengeIds(challengeIds);

  return {
    skillChallenges,
    tubeSkills,
    attachments,
  };
}
