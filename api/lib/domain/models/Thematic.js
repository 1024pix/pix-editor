export class Thematic {
  constructor({
    id,
    name_i18n,
    index,
    airtableId,
    competenceId,
    competenceAirtableId,
    tubeIds,
    tubeAirtableIds,
  }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.index = index;
    this.airtableId = airtableId;
    this.competenceId = competenceId;
    this.competenceAirtableId = competenceAirtableId;
    this.tubeIds = tubeIds;
    this.tubeAirtableIds = tubeAirtableIds;
  }
}
