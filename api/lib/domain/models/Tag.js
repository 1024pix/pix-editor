export class Tag {
  constructor({ id, airtableId, title, notes, description, skillAirtableIds, tutorialAirtableIds }) {
    this.id = id;
    this.airtableId = airtableId;
    this.title = title;
    this.notes = notes;
    this.description = description;
    this.skillAirtableIds = skillAirtableIds;
    this.tutorialAirtableIds = tutorialAirtableIds;
  }
}
