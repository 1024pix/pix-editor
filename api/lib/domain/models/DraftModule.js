import { Module } from './Module.js';

export class DraftModule extends Module {
  constructor({ moduleId, ...attrs } = {}) {
    super(attrs);
    this.moduleId = moduleId;
  }

  prepareForCreation() {
    this.id = crypto.randomUUID();
    this.shortId = this.id.slice(0, 8);
  }
}
