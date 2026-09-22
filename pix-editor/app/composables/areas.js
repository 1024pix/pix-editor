import { defineQuery, useQuery } from '@pinia/colada';

import AreaRepository from '../repositories/area-repository';

export const useAreas = defineQuery(() => {
  return useQuery({
    key: ['areas'],
    query: () => AreaRepository.list(),
  });
});
