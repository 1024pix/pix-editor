export class Tube {
  constructor({
    id,
    airtableId,
    name,
    practicalTitle_i18n,
    practicalDescription_i18n,
    index,
    thematicAirtableId,
    competenceAirtableId,
    competenceId,
    skillAirtableIds,
    skillIds,
  }) {
    this.id = id;
    this.airtableId = airtableId;
    this.name = name;
    this.practicalTitle_i18n = practicalTitle_i18n;
    this.practicalDescription_i18n = practicalDescription_i18n;
    this.index = index;
    this.thematicAirtableId = thematicAirtableId;
    this.competenceAirtableId = competenceAirtableId;
    this.competenceId = competenceId;
    this.skillAirtableIds = skillAirtableIds;
    this.skillIds = skillIds;
  }

  static get WORKBENCH_NAME() {
    return '@workbench';
  }

  get isWorkbench() {
    return this.name === Tube.WORKBENCH_NAME;
  }

  /**
   * @param {import('./Thematic.js').Thematic} thematic
   */
  prepareForCreation(thematic) {
    this.competenceAirtableId = thematic.competenceAirtableId;
    this.index = thematic.tubeAirtableIds.length;
  }
}
