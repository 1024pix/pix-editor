import _ from 'lodash';

export class Release {
  constructor({ id, content, createdAt } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.content = content;
  }

  get operativeChallenges() {
    return this.content.challenges.filter((c) => c.isOperative);
  }

  findOriginForChallenge(challenge) {
    const competence = findCompetenceForChallenge(challenge, this.content);
    return competence?.origin ?? null;
  }

  findCompetenceNameForChallenge(challenge) {
    const competence = findCompetenceForChallenge(challenge, this.content);
    return competence?.name_i18n.fr ?? null;
  }

  findTubeNameForChallenge(challenge) {
    const tube = findTubeForChallenge(challenge, this.content);
    return tube?.name ?? null;
  }

  findSkillNameForChallenge(challenge) {
    const skill = findSkillForChallenge(challenge, this.content);
    return skill?.name ?? null;
  }
}

function findCompetenceForChallenge(challenge, content) {
  const skill = findSkillForChallenge(challenge, content);
  if (!skill) return null;
  return findCompetenceForSkill(skill, content);
}

function findTubeForChallenge(challenge, content) {
  const skill = findSkillForChallenge(challenge, content);
  if (!skill) return null;
  return content.tubes.find(({ id }) => skill.tubeId === id) ?? null;
}

function findSkillForChallenge(challenge, content) {
  return content.skills.find(({ id }) => challenge.skillId === id) ?? null;
}

function findCompetenceForSkill(skill, content) {
  return content.competences.find(({ id }) => skill.competenceId === id) ?? null;
}
