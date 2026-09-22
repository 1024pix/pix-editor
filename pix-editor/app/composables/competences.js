import { useQuery } from '@pinia/colada';

import CompetenceRepository from '../repositories/competence-repository';

export function useCompetencesByAreaIds(areaIds) {
  return useQuery({
    key: () => ['areas', areaIds.value, 'competences'],
    query: () => CompetenceRepository.list(), // TODO: filter by areaIds
    enabled: () => areaIds.value?.length > 0,
  });
}
