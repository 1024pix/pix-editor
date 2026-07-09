import { buildModule } from './build-module.js';
import { DraftModule } from '../../../../lib/domain/models/index.js';

export function buildDraftModule({
  moduleId = null,
  hasBeenValidated = false,
  validationErrors = null,
  version = '0.1',
  ...moduleAttributes
} = {}) {
  const module = buildModule({ ...moduleAttributes, version });
  return new DraftModule({
    ...module,
    moduleId,
    hasBeenValidated,
    validationErrors,
  });
}
