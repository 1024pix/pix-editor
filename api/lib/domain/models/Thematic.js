export class Thematic {
  constructor({
    id,
    name_i18n,
    index,
    airtableId,
    competenceId,
    tubeIds,
  }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.index = index;
    this.airtableId = airtableId;
    this.competenceId = competenceId;
    this.tubeIds = tubeIds;
  }

  static get WORKBENCH() {
    return 'workbench';
  }

  get isWorkbench() {
    return this.name_i18n['fr'].startsWith(Thematic.WORKBENCH);
  }
}
