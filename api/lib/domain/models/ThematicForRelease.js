module.exports = class ThematicForRelease {
  constructor({
    id,
    name,
    nameEnUs,
    index,
    competenceId,
    tubeIds,
  }) {
    this.id = id;
    this.name = name;
    this.nameEnUs = nameEnUs;
    this.index = index;
    this.competenceId = competenceId;
    this.tubeIds = tubeIds;
  }
};
