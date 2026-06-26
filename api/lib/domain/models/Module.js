import * as config from '../../config.js';

export class Module {
  constructor({
    id,
    shortId,
    internalTitle,
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
    this.internalTitle = internalTitle;
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

  get url() {
    return new URL(`/modules/${this.shortId}/${this.slug}`, config.pixApp.production.baseUrlFr).href;
  }

  get previewUrl() {
    return new URL(`/modules/preview/${this.shortId}/${this.slug}`, config.pixApp.production.baseUrlFr).href;
  }

  serializeToJSON() {
    const {
      id,
      shortId,
      internalTitle,
      slug,
      title,
      isBeta,
      visibility,
      details,
      sections,
      glossary,
    } = this;
    return JSON.stringify({
      id,
      shortId,
      internalTitle,
      slug,
      title,
      isBeta,
      visibility,
      details,
      sections,
      glossary,
    }, null, 2);
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
