import _ from 'lodash';

export class Release {
  constructor({
    id,
    content,
    createdAt,
  } = {}) {
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

  findCompetenceNamesForTutorial(tutorial) {
    const skills = findSkillsUsingTutorial(tutorial, this.content);
    const rawCompetenceNames = skills.map((skill) => skill ? findCompetenceForSkill(skill, this.content)?.name_i18n.fr : null);
    return _.uniq(_.compact(rawCompetenceNames));
  }

  findSkillNamesForTutorial(tutorial) {
    const skills = findSkillsUsingTutorial(tutorial, this.content);
    return skills.map((s) => s.name);
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
  const tube = content.tubes.find(({ id }) => skill.tubeId === id);
  if (!tube) return null;
  return tube;
}

function findSkillForChallenge(challenge, content) {
  const skill = content.skills.find(({ id }) => challenge.skillId === id);
  if (!skill) return null;
  return skill;
}

function findCompetenceForSkill(skill, content) {
  const tube = content.tubes.find(({ id }) => skill.tubeId === id);
  if (!tube) return null;
  const competence = content.competences.find(({ id }) => tube.competenceId === id);
  return competence ?? null;
}

function findSkillsUsingTutorial(tutorial, content) {
  return content.skills.filter((skill) => {
    return skill.tutorialIds.includes(tutorial.id) ||
      skill.learningMoreTutorialIds.includes(tutorial.id);
  });
}
