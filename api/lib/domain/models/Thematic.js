export class Thematic {
  constructor({ id, name_i18n, index, airtableId, competenceId, competenceAirtableId, tubeIds, tubeAirtableIds }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.index = index;
    this.airtableId = airtableId;
    this.competenceId = competenceId;
    this.competenceAirtableId = competenceAirtableId;
    this.tubeIds = tubeIds;
    this.tubeAirtableIds = tubeAirtableIds;
  }

  /**
   * @param {Thematic[]} competenceThematics
   */
  prepareForCreation(competenceThematics) {
    this.index = competenceThematics.length;
  }

  /**
   * @param {Thematic} thematicUpdates
   */
  update(thematicUpdates) {
    this.index = thematicUpdates.index;
    this.name_i18n.en = thematicUpdates.name_i18n.en;
    this.name_i18n.fr = thematicUpdates.name_i18n.fr;
  }
}
