import { databaseBuffer } from '../database-buffer.js';

export function buildLocalizedFrameworkTubes(
  {
    id = databaseBuffer.nextId++,
    tubeId = '',
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
