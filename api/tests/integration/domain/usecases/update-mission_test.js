import { describe, describe as context, expect, it, expectTypeOf } from 'vitest';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { updateMission } from '../../../../lib/domain/usecases/index.js';
import { airtableBuilder, databaseBuilder } from '../../../test-helper.js';
import { Challenge, Mission } from '../../../../lib/domain/models/index.js';
import { BadRequestError } from '../../../../lib/infrastructure/errors.js';
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

    context('when requested status is not VALIDATED', function() {
      it('should return the updated mission', async () => {
        // given
        const mission = databaseBuilder.factory.buildMission({ createdAt: new Date('2023-12-25') });
        await databaseBuilder.commit();

        const missionToUpdate = new Mission({
          id: mission.id,
          name_i18n: { fr: 'Updated mission'  },
          competenceId: 'QWERTY',
          thematicIds: 'Thematic',
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
    context('when requested status is VALIDATED', function() {
      context('when all challenges in the mission has VALIDATED status', function() {
        it('should return the updated mission', async () => {
          const mockedLearningContent =  {
            challenges: [
              airtableBuilder.factory.buildChallenge({ id: 'challengeTuto1', status: Challenge.STATUSES.VALIDE, skillId: 'skillTuto1' }),
              airtableBuilder.factory.buildChallenge({ id: 'challengeTraining1', status: Challenge.STATUSES.VALIDE, skillId: 'skillTraining1' }),
            ],
          };

          airtableBuilder.mockLists(mockedLearningContent);

          buildLocalizedChallenges(mockedLearningContent);

          // given
          const mission = databaseBuilder.factory.buildMission({ createdAt: new Date('2023-12-25') });
          await databaseBuilder.commit();

          const missionToUpdate = new Mission({
            id: mission.id,
            name_i18n: { fr: 'Updated mission'  },
            competenceId: 'QWERTY',
            thematicIds: 'Thematic',
            learningObjectives_i18n:  { fr: null },
            validatedObjectives_i18n: { fr: 'Très bien' },
            status: Mission.status.VALIDATED,
            createdAt: new Date('2023-12-25')
          });

          // when
          const updatedMission = await updateMission(missionToUpdate);

          // then
          expectTypeOf(updatedMission).toEqualTypeOf('Mission');
          await expect(updatedMission).to.deep.equal(missionToUpdate);

        });
      });
      context('when some challenges in the mission has PROPOSE status', function() {
        it('should return not update the mission', async () => {
          const mockedLearningContent =  {
            challenges: [
              airtableBuilder.factory.buildChallenge({ id: 'challengeTuto1', status: Challenge.STATUSES.VALIDE, skillId: 'skillTuto1' }),
              airtableBuilder.factory.buildChallenge({ id: 'challengeTraining1', status: Challenge.STATUSES.PROPOSE, skillId: 'skillTraining1' }),
              airtableBuilder.factory.buildChallenge({ id: 'challengeTraining2', status: Challenge.STATUSES.PROPOSE, skillId: 'skillTraining2' }),
            ],
          };

          airtableBuilder.mockLists(mockedLearningContent);

          buildLocalizedChallenges(mockedLearningContent);

          // given
          const mission = databaseBuilder.factory.buildMission({ createdAt: new Date('2023-12-25') });
          await databaseBuilder.commit();

          const missionToUpdate = new Mission({
            id: mission.id,
            name_i18n: { fr: 'Updated mission'  },
            competenceId: 'QWERTY',
            thematicIds: 'Thematic',
            learningObjectives_i18n:  { fr: null },
            validatedObjectives_i18n: { fr: 'Très bien' },
            status: Mission.status.VALIDATED,
            createdAt: new Date('2023-12-25')
          });

          // when
          const promise = updateMission(missionToUpdate);

          // then
          await expect(promise).rejects.to.deep.equal(new BadRequestError('La mission ne peut pas être mise à jour car les challenges "challengeTraining1", "challengeTraining2" ne sont pas au status VALIDE'));

        });

      });
    });

  });
});

function buildLocalizedChallenges(mockedLearningContent) {
  mockedLearningContent.challenges.forEach((airtableChallenge) => {
    databaseBuilder.factory.buildLocalizedChallenge({
      id: airtableChallenge.fields['id persistant'],
      challengeId: airtableChallenge.fields['id persistant']
    });
  });
}
