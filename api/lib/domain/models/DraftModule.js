import { Module } from './Module.js';

export class DraftModule extends Module {
  constructor({ moduleId, ...attrs } = {}) {
    super(attrs);
    this.moduleId = moduleId;
  }

  /**
   * @param {import('./Module.js').Module} module
   */
  prepareForCreation(module) {
    this.id = module?.id ?? crypto.randomUUID();
    this.shortId = module?.shortId ?? this.id.slice(0, 8);
  }
}
