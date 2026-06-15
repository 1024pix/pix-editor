import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id?: number
 *   tubeId: string
 *   maxLevel?: number
 *   locale?: string
 * }} localizedFrameworkTubeToBuild
 */
export function buildLocalizedFrameworkTubes(
  {
    id = databaseBuffer.nextId++,
    tubeId,
    maxLevel = 5,
    locale = 'bz',
  } = {},
) {
  const values = {
    id,
    tubeId,
    maxLevel,
    locale,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'localized_framework_tubes',
    values,
  });
}
