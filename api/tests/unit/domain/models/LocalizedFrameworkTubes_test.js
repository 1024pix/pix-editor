import { describe, expect, test } from 'vitest';
import { LocalizedFrameworkTubes } from '../../../../lib/domain/models/index.js';
import { catchErr } from '../../../test-helper.js';
import { InvalidLocalizedFrameworkTubesError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | LocalizedFrameworkTubes', () => {
  describe('when max-level is out of range (0-8)', () => {
    test('should return an exception', async function() {
      const localizedFrameworkTubes = new LocalizedFrameworkTubes({
        maxLevel: 9,
        locale: 'locale',
        tubeId: 'tubeId',
      });
      const error = await catchErr(localizedFrameworkTubes.validate, localizedFrameworkTubes)();

      expect(error).to.be.instanceOf(InvalidLocalizedFrameworkTubesError);
      expect(error.message).to.be.equal('MaxLevel out of range');
    });
  });
});
