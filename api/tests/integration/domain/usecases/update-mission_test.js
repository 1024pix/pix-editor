import { describe, describe as context, expect, it, expectTypeOf } from 'vitest';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { updateMission } from '../../../../lib/domain/usecases/index.js';
import { databaseBuilder } from '../../../test-helper.js';
import { Mission } from '../../../../lib/domain/models/index.js';
describe('Integration | Usecases | Update mission', function() {
  context('When the mission to update does not exist', function() {
    it('should return a not found error', async () => {
      // given
      const id = 1;

      // when
      const promise = updateMission({ id });

      // then
      await expect(promise).rejects.to.deep.equal(new NotFoundError('Mission introuvable'));
    });
  });
  context('When the mission exists', function() {
    it('should return the updated mission', async () => {
      // given
      const mission = databaseBuilder.factory.buildMission({ createdAt: new Date('2023-12-25') });
      await databaseBuilder.commit();

      const missionToUpdate = new Mission({
        id: mission.id,
        name_i18n: { fr: 'Updated mission'  },
        competenceId: 'QWERTY',
        thematicId: 'Thematic',
        learningObjectives_i18n:  { fr: null },
        validatedObjectives_i18n: { fr: 'Très bien' },
        status: Mission.status.INACTIVE,
        createdAt: new Date('2023-12-25')
      });

      // when
      const updatedMission = await updateMission(missionToUpdate);

      // then
      expectTypeOf(updatedMission).toEqualTypeOf('Mission');
      await expect(updatedMission).to.deep.equal(missionToUpdate);

    });
  });
});
