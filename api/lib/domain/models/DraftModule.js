import { Module } from './Module.js';

export class DraftModule extends Module {
  constructor({ moduleId, ...attrs } = {}) {
    super({ ...attrs });
    this.moduleId = moduleId;
  }
}
