import { Module } from './Module.js';

/**
 * Module enriched with readonly information for consultation.
 */
export class ModuleForConsultation extends Module {
  constructor({ draftModuleId, publishedBy = null, ...attrs } = {}) {
    super(attrs);
    this.draftModuleId = draftModuleId;
    this.publishedBy = publishedBy;
  }
}
