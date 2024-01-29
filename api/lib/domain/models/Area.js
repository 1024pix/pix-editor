export class Area {
  constructor({
    id,
    code,
    title_i18n,
    competenceIds,
    competenceAirtableIds,
    color,
    frameworkId,
  }) {
    this.id = id;
    this.code = code;
    this.title_i18n = title_i18n;
    this.competenceIds = competenceIds;
    this.competenceAirtableIds = competenceAirtableIds;
    this.color = color;
    this.frameworkId = frameworkId;

    this.name = `${code}. ${title_i18n.fr}`;
  }
}
