import { Module } from './Module.js';

/**
 * Module enriched with readonly information for consultation.
 */
export class ModuleForConsultation extends Module {
  constructor({ draftModuleId, ...attrs } = {}) {
    super(attrs);
    this.draftModuleId = draftModuleId;
  }
}
