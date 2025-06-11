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

  /**
   * @param {Tube} updates
   */
  update(updates) {
    this.name = updates.name;
    this.index = updates.index;
    this.practicalTitle_i18n.fr = updates.practicalTitle_i18n.fr;
    this.practicalTitle_i18n.en = updates.practicalTitle_i18n.en;
    this.practicalDescription_i18n.fr = updates.practicalDescription_i18n.fr;
    this.practicalDescription_i18n.en = updates.practicalDescription_i18n.en;
  }
}
