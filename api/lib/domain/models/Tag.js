export class Tag {
  constructor({ id, airtableId, name, skillAirtableIds, tutorialAirtableIds }) {
    this.id = id;
    this.airtableId = airtableId;
    this.name = name;
    this.skillAirtableIds = skillAirtableIds;
    this.tutorialAirtableIds = tutorialAirtableIds;
  }
}
