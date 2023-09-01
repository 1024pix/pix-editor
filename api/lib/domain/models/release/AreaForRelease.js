export class AreaForRelease {
  constructor({
    id,
    code,
    title_i18n,
    name,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  }) {
    this.id = id;
    this.code = code;
    this.title_i18n = title_i18n;
    this.competenceIds = competenceIds;
    this.name = name;
    this.competenceAirtableIds = competenceAirtableIds;
    this.color = color;
    this.frameworkId = frameworkId;
  }
}
