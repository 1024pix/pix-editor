module.exports = class ThematicForRelease {
  constructor({
    id,
    name_i18n,
    index,
    competenceId,
    tubeIds,
  }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.index = index;
    this.competenceId = competenceId;
    this.tubeIds = tubeIds;
  }
};
