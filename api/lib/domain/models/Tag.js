export class Tag {
  constructor({
    id,
    airtableId,
    title,
    description,
    notes,
    skillAirtableId,
    tutorialAirtableIds,
  }) {
    this.id = id;
    this.airtableId = airtableId;
    this.title = title;
    this.description = description;
    this.notes = notes;
    this.skillAirtableId = skillAirtableId;
    this.tutorialAirtableIds = tutorialAirtableIds || [];
  }
}
