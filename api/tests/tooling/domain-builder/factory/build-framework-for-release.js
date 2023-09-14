import { FrameworkForRelease } from '../../../../lib/domain/models/release/FrameworkForRelease.js';

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
