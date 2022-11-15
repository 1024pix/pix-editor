module.exports = class TubeForRelease {
  constructor({
    id,
    name,
    title,
    description,
    practicalTitleFrFr,
    practicalTitleEnUs,
    practicalDescriptionFrFr,
    practicalDescriptionEnUs,
    competenceId,
    isMobileCompliant,
    isTabletCompliant,
  }) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.description = description;
    this.practicalTitleFrFr = practicalTitleFrFr;
    this.practicalTitleEnUs = practicalTitleEnUs;
    this.practicalDescriptionFrFr = practicalDescriptionFrFr;
    this.practicalDescriptionEnUs = practicalDescriptionEnUs;
    this.competenceId = competenceId;
    this.isMobileCompliant = isMobileCompliant;
    this.isTabletCompliant = isTabletCompliant;
  }
};
