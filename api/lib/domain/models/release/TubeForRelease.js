module.exports = class TubeForRelease {
  constructor({
    id,
    name,
    title,
    description,
    practicalTitle_i18n,
    practicalDescription_i18n,
    competenceId,
    isMobileCompliant,
    isTabletCompliant,
    thematicId,
    skillIds,
  }) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.description = description;
    this.practicalTitle_i18n = practicalTitle_i18n,
    this.practicalDescription_i18n = practicalDescription_i18n,
    this.competenceId = competenceId;
    this.isMobileCompliant = isMobileCompliant;
    this.isTabletCompliant = isTabletCompliant;
    this.thematicId = thematicId;
    this.skillIds = skillIds;
  }
};
