import { frameworkRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiReleaseCache from '../services/update-pix-api-release-cache.js';

export async function createFramework(framework) {
  const createdFramework = await frameworkRepository.create(framework);
  await updatePixApiReleaseCache.onFrameworkCreated(createdFramework);
  return createdFramework;
}
