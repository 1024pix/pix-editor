import { localizedFrameworksTubesRepository } from '../../infrastructure/repositories/index.js';
import { localizedFrameworkTubesSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

export async function findAll(request, h) {
  const localizedFrameworksTubes = await localizedFrameworksTubesRepository.findAll();
  return h.response(localizedFrameworkTubesSerializer.serializeLocalizedFrameworkTubes(localizedFrameworksTubes));
}

export async function create(request, h) {
  const localizeFrameworkTube = localizedFrameworkTubesSerializer.deserializeLocalizedFrameworkTubes(request?.payload?.data?.attributes);
  localizeFrameworkTube.validate();

  const createdLocalizedFrameworkTubes = await localizedFrameworksTubesRepository.save(localizeFrameworkTube);
  return h.response(localizedFrameworkTubesSerializer.serializeLocalizedFrameworkTubes(createdLocalizedFrameworkTubes)).created();
}
