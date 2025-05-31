import { areaRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiCache from '../services/update-pix-api-cache.js';

export async function createArea(area) {
  const areas = await areaRepository.listByFrameworkId(area.frameworkId);

  area.code = `${(areas?.length ?? 0) + 1}`;

  const createdArea = await areaRepository.create(area);
  await updatePixApiCache.updateArea({ area: createdArea, operation: updatePixApiCache.OPERATIONS.ADD });
  return createdArea;
}
