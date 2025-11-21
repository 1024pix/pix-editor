import { localizedFrameworksTubesRepository } from '../../infrastructure/repositories/index.js';
import { localizedFrameworkTubesSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

export async function findAll(request, h) {
  const localizedFrameworksTubes = await localizedFrameworksTubesRepository.findAll();
  return h.response(localizedFrameworkTubesSerializer.serializeLocalizedFrameworkTubes(localizedFrameworksTubes));
}
