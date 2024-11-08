import {  Framework } from '../../../../lib/domain/models/index.js';

export function buildFramework({
  id = 'recFvllz2Ckz',
  name = 'Nom du referentiel',
  areaIds = ['recArea1'],
} = {}) {
  return new Framework({
    id,
    name,
    areaIds,
  });
}
