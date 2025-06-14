import { areaRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function createArea(area) {
  const areas = await areaRepository.listByFrameworkId(area.frameworkId);

  area.code = `${(areas?.length ?? 0) + 1}`;

  const createdArea = await areaRepository.create(area);
  await updatePixApiReleaseCache.onAreaCreated(createdArea);
  return createdArea;
}
