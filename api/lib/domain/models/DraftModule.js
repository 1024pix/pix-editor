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

  get url() {
    return new URL(`/modules/${this.shortId}/${this.slug}`, config.pixApp.recette.baseUrlFr).href;
  }

  get previewUrl() {
    return new URL(`/modules/preview/${this.shortId}/${this.slug}`, config.pixApp.recette.baseUrlFr).href;
  }
}
