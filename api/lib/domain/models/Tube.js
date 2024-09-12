export class Tube {
  constructor({
    id,
    airtableId,
    name,
    practicalTitle_i18n,
    practicalDescription_i18n,
    competenceId,
  }) {
    this.id = id;
    this.airtableId = airtableId;
    this.name = name;
    this.practicalTitle_i18n = practicalTitle_i18n;
    this.practicalDescription_i18n = practicalDescription_i18n;
    this.competenceId = competenceId;
  }
}
