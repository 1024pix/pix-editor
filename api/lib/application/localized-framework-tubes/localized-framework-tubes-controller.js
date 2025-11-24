import { localizedFrameworksTubesRepository } from '../../infrastructure/repositories/index.js';
import { localizedFrameworkTubesSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

export async function findAll(request, h) {
  const localizedFrameworksTubes = await localizedFrameworksTubesRepository.findAll();
  return h.response(localizedFrameworkTubesSerializer.serializeLocalizedFrameworkTubes(localizedFrameworksTubes));
}

export async function upsert(request, h) {
  const attributes = request?.payload?.data?.attributes;
  const id = request?.params?.id;

  const localizeFrameworkTube = localizedFrameworkTubesSerializer.deserializeLocalizedFrameworkTubes({
    id,
    ...attributes,
  });
  localizeFrameworkTube.validate();

  const createdLocalizedFrameworkTubes = await localizedFrameworksTubesRepository.save(localizeFrameworkTube);
  return h.response(localizedFrameworkTubesSerializer.serializeLocalizedFrameworkTubes(createdLocalizedFrameworkTubes)).created();
}

export async function remove(request, h) {
  const id = request?.params?.id;
  await localizedFrameworksTubesRepository.remove(id);
  return h.response().code(204);
}
