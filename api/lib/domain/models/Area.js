export class Area {
  constructor({
    id,
    airtableId,
    code,
    title_i18n,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  }) {
    this.id = id;
    this.airtableId = airtableId;
    this.code = code;
    this.title_i18n = title_i18n;
    this.competenceIds = competenceIds;
    this.competenceAirtableIds = competenceAirtableIds;
    this.color = color;
    this.frameworkId = frameworkId;
  }

  get name() {
    return `${this.code}. ${this.title_i18n.fr}`;
  }

  static get COLORS() {
    return {
      JAFFA: 'jaffa',
      EMERALD: 'emerald',
      CERULEAN: 'cerulean',
      WILD_STRAWBERRY: 'wild-strawberry',
      BUTTERFLY_BUSH: 'butterfly-bush',
      NONE: '',
    };
  }
}
