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
    const competence = _findCompetenceForChallenge(challenge, this.content);
    return competence?.origin ?? null;
  }

  findCompetenceNameForChallenge(challenge) {
    const competence = _findCompetenceForChallenge(challenge, this.content);
    return competence?.name_i18n.fr ?? null;
  }

  findSkillNameForChallenge(challenge) {
    const skill = _findSkillForChallenge(challenge, this.content);
    return skill?.name ?? null;
  }

  findCompetenceNamesForTutorial(tutorial) {
    const skills = _findSkillsUsingTutorial(tutorial, this.content);
    const rawCompetenceNames = skills.map((skill) => skill ? _findCompetenceForSkill(skill, this.content)?.name_i18n.fr : null);
    return _.uniq(_.compact(rawCompetenceNames));
  }

  findSkillNamesForTutorial(tutorial) {
    const skills = _findSkillsUsingTutorial(tutorial, this.content);
    return skills.map((s) => s.name);
  }
}

function _findCompetenceForChallenge(challenge, content) {
  const skill = _findSkillForChallenge(challenge, content);
  if (!skill) return null;
  return _findCompetenceForSkill(skill, content);
}

function _findSkillForChallenge(challenge, content) {
  const skill = content.skills.find(({ id }) => challenge.skillId === id);
  if (!skill) return null;
  return skill;
}

function _findCompetenceForSkill(skill, content) {
  const tube = content.tubes.find(({ id }) => skill.tubeId === id);
  if (!tube) return null;
  const competence = content.competences.find(({ id }) => tube.competenceId === id);
  return competence ?? null;
}

function _findSkillsUsingTutorial(tutorial, content) {
  return content.skills.filter((skill) => {
    return skill.tutorialIds.includes(tutorial.id) ||
      skill.learningMoreTutorialIds.includes(tutorial.id);
  });
}
