module.exports = class Skill {
  constructor({
    // attributes
    id,
    name,
    hintFrFr,
    hintEnUs,
    hintStatus,
    tutorialIds,
    learningMoreTutorialIds,
    pixValue,
    competenceId,
    status,
    tubeId,
    // includes
    // references
  } = {}) {
    // attributes
    this.id = id;
    this.name = name;
    this.hintFrFr = hintFrFr;
    this.hintEnUs = hintEnUs;
    this.hintStatus = hintStatus;
    this.tutorialIds = tutorialIds;
    this.learningMoreTutorialIds = learningMoreTutorialIds;
    this.pixValue = pixValue;
    this.competenceId = competenceId;
    this.status = status;
    this.tubeId = tubeId;
    // includes
    // references
  }
};
