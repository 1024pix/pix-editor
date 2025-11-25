import { describe, expect, it } from 'vitest';
import { localizedFrameworksTubesRepository } from '../../../../lib/infrastructure/repositories/index.js';

describe('Integration | Repository | localized-framework-tubes-repository', function() {
  it('should return an error if tube does not exists', async () => {
    // given
    const localizedFrameworkTubesDTO = {
      locale: 'nl',
      maxLevel: 2,
      tubeId: 'unknown',
    };

    await expect(localizedFrameworksTubesRepository.save(localizedFrameworkTubesDTO)).rejects.to.contain({ constraint: 'localized_framework_tubes_tubeid_foreign' });
  });
});
