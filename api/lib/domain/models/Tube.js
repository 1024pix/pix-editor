module.exports = class Tube {
  constructor({
    // attributes
    id,
    name,
    title,
    description,
    practicalTitleFrFr,
    practicalTitleEnUs,
    practicalDescriptionFrFr,
    practicalDescriptionEnUs,
    competenceId,
    // includes
    // references
  } = {}) {
    // attributes
    this.id = id;
    this.name = name;
    this.title = title;
    this.description = description;
    this.practicalTitleFrFr = practicalTitleFrFr;
    this.practicalTitleEnUs = practicalTitleEnUs;
    this.practicalDescriptionFrFr = practicalDescriptionFrFr;
    this.practicalDescriptionEnUs = practicalDescriptionEnUs;
    this.competenceId = competenceId;
    // includes
    // references
  }
};
