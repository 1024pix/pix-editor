class Area {

  constructor({
    id,
    // attributes
    code,
    name,
    // includes
    // references
    competenceIds,
    competenceAirtableIds,
  } = {}) {
    this.id = id;
    // attributes
    this.code = code;
    this.name = name;
    // includes
    // references
    this.competenceIds = competenceIds;
    this.competenceAirtableIds = competenceAirtableIds;
  }
}

module.exports = Area;
