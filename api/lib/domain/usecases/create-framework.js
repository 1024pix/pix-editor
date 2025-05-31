import { frameworkRepository } from '../../infrastructure/repositories/index.js';
import * as updatePixApiCache from '../services/update-pix-api-cache.js';

export async function createFramework(framework) {
  const createdFramework = await frameworkRepository.create(framework);
  await updatePixApiCache.updateFramework({ framework: createdFramework, operation: updatePixApiCache.OPERATIONS.ADD });
  return createdFramework;
}
