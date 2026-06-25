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
}
