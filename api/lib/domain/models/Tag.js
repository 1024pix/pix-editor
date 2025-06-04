export class Tag {
  constructor({ id, airtableId, title, skillAirtableIds, tutorialAirtableIds }) {
    this.id = id;
    this.airtableId = airtableId;
    this.title = title;
    this.skillAirtableIds = skillAirtableIds;
    this.tutorialAirtableIds = tutorialAirtableIds;
  }
}
