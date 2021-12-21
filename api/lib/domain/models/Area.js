module.exports = class Area {
  constructor({
    id,
    code,
    titleFrFr,
    titleEnUs,
    name,
    competenceIds,
    competenceAirtableIds,
    color,
  } = {}) {
    this.id = id;
    this.code = code;
    this.titleFrFr = titleFrFr;
    this.titleEnUs = titleEnUs;
    this.competenceIds = competenceIds;
    this.name = name;
    this.competenceAirtableIds = competenceAirtableIds;
    this.color = color;
  }
};
