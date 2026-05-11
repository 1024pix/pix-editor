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

  prepareForCreation() {
    this.id = crypto.randomUUID();
    this.shortId = generateShortId();
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

function generateShortId() {
  const arr = new Uint8Array(4);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}
