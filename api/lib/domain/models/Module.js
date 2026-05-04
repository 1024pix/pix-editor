export class Module {
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
    createdAt,
    updatedAt,
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
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static get LEVELS() {
    return {
      NOVICE: 'novice',
      INDEPENDENT: 'independent',
      ADVANDCED: 'advandced',
      EXPERT: 'expert',
    };
  }

  static get VISIBILITIES() {
    return {
      PUBLIC: 'public',
      PRIVATE: 'private',
    };
  }
}
