import { FrameworkForRelease } from '../../../../lib/domain/models/release/index.js';

export function buildFrameworkForRelease(
  {
    id = 'recFvllz2Ckz',
    name = 'Nom du referentiel'
  } = {}) {
  return new FrameworkForRelease({
    id,
    name
  });
}
