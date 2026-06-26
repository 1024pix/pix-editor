import * as config from '../../config.js';
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

  get url() {
    return new URL(`/modules/${this.shortId}/${this.slug}`, config.pixApp.baseUrlFr).href;
  }

  get previewUrl() {
    return new URL(`/modules/preview/${this.shortId}/${this.slug}`, config.pixApp.baseUrlFr).href;
  }
}
