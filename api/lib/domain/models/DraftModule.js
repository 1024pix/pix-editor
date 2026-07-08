import * as config from '../../config.js';
import { Module } from './Module.js';

export class DraftModule extends Module {
  constructor({ moduleId, hasBeenValidated, validationErrors, ...attrs } = {}) {
    super(attrs);
    this.moduleId = moduleId;
    this.hasBeenValidated = hasBeenValidated;
    this.validationErrors = validationErrors;
  }

  /**
   * @param {import('./Module.js').Module} module
   */
  prepareForCreation(module) {
    this.id = module?.id ?? crypto.randomUUID();
    this.shortId = module?.shortId ?? this.id.slice(0, 8);
    this.version = incrementMinorVersion(module?.version) ?? '0.1';
  }

  /**
   * @param {DraftModule} module
   */
  update(module) {
    this.internalTitle = module.internalTitle;
    this.slug = module.slug;
    this.title = module.title;
    this.isBeta = module.isBeta;
    this.visibility = module.visibility;
    this.details = module.details;
    this.sections = module.sections;
    this.glossary = module.glossary;
  }

  publish() {
    return new Module({
      id: this.id,
      details: this.details,
      glossary: this.glossary,
      internalTitle: this.internalTitle,
      isBeta: this.isBeta,
      sections: this.sections,
      shortId: this.shortId,
      slug: this.slug,
      title: this.title,
      visibility: this.visibility,
    });
  }

  get url() {
    return new URL(`/modules/${this.shortId}/${this.slug}`, config.pixApp.recette.baseUrlFr).href;
  }

  get previewUrl() {
    return new URL(`/modules/preview/${this.shortId}/${this.slug}`, config.pixApp.recette.baseUrlFr).href;
  }
}

function incrementMinorVersion(version) {
  return version?.replace(/\d+$/, (minorVersion) => parseInt(minorVersion) + 1);
}
