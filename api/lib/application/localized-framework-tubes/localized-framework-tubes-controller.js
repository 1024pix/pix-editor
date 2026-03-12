import { localizedFrameworksTubesRepository } from '../../infrastructure/repositories/index.js';
import { localizedFrameworkTubesSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';

export async function filter(request, h) {
  const params = extractParameters(request.query);
  const competenceId = params.filter.competenceId;
  const locale = params.filter.locale;

  const localizedFrameworksTubes = await localizedFrameworksTubesRepository.filter({ competenceId, locale });
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

  const [createdLocalizedFrameworkTube] = await localizedFrameworksTubesRepository.save([localizeFrameworkTube]);

  return h.response(localizedFrameworkTubesSerializer.serializeLocalizedFrameworkTubes(createdLocalizedFrameworkTube)).created();
}
