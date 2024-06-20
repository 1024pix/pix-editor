export class Area {
  constructor({
    id,
    code,
    name,
    title_i18n,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.title_i18n = title_i18n;
    this.competenceIds = competenceIds;
    this.competenceAirtableIds = competenceAirtableIds;
    this.color = color;
    this.frameworkId = frameworkId;
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
