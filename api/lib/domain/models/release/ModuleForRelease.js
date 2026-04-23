export class ModuleForRelease {
  constructor({
    id,
    shortId,
    slug,
    title,
    isBeta,
    visibility,
    details,
    sections,
    glossary,
  } = {}) {
    this.id = id;
    this.shortId = shortId;
    this.slug = slug;
    this.title = title;
    this.isBeta = isBeta;
    this.visibility = visibility;
    this.details = details;
    this.sections = sections;
    this.glossary = glossary;
  }
}
