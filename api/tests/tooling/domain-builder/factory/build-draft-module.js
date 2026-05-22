import { buildModule } from './build-module.js';
import { DraftModule } from '../../../../lib/domain/models/index.js';

export function buildDraftModule({ moduleId = null, ...moduleAttributes } = {}) {
  const module = buildModule(moduleAttributes);
  return new DraftModule({ ...module, moduleId });
}
