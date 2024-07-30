import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { hFake } from '../../../test-helper.js';
import * as missionsController from '../../../../lib/application/missions/mission-controller.js';
import * as usecases from '../../../../lib/domain/usecases/index.js';
import { Mission } from '../../../../lib/domain/models/index.js';
import { MissionSummary } from '../../../../lib/domain/readmodels/index.js';

describe('Unit | Controller | missions controller', function() {
  describe('findMissions', function() {
    let findAllMissions;

    beforeEach(function() {
      findAllMissions = vi.spyOn(usecases, 'findAllMissions');
      findAllMissions.mockResolvedValue(
        {
          missions: [
            new MissionSummary({
              id: 1,
              name: 'Ma première mission',
              competence: '1.1 Ma compétence',
              status: Mission.status.VALIDATED,
              createdAt: new Date('2010-01-04'),
            })],
          meta: {}
        });
    });

    it('should call the repository with all query params when they are valid', async function() {
      // given
      const request = { query: { 'page[size]': 5, 'page[number]': 3, 'filter[statuses][]': ['VALIDATED'] } };

      // when
      await missionsController.findMissions(request, hFake);

      // then
      expect(findAllMissions).toHaveBeenCalledWith({ filter: { statuses: ['VALIDATED'] }, page: { number: 3, size: 5 } });
    });
    it('should return the serialized mission with french translations', async function() {
      // given
      const request = { query: { 'page[size]': 5, 'page[number]': 3, 'filter[statuses][]': ['VALIDATED'] } };

      // when
      const result = await missionsController.findMissions(request, hFake);

      // then
      expect(result.source.data).to.deep.equal([
        {
          type: 'mission-summaries',
          id: '1',
          attributes: {
            name: 'Ma première mission',
            competence: '1.1 Ma compétence',
            'created-at': new Date('2010-01-04'),
            status: Mission.status.VALIDATED
          }
        }
      ]);
    });

    describe('pagination', function() {
      const filter = {};

      it('ignore unknown pagination parameters', async function() {
        // given
        const request = { query: { 'page[size]': 5, 'page[number]': 3, 'page[hello]': 'oui' } };

        // when
        await missionsController.findMissions(request, hFake);

        // then
        expect(findAllMissions).toHaveBeenCalledWith({ filter, page: { number: 3, size: 5 } });
      });

      context('page size', function() {

        it('should use default page.size default value when it is not a positive integer', async function() {
          // given
          const request0 = { query: { 'page[size]': -5, 'page[number]': 3 } };
          const request1 = { query: { 'page[size]': 'coucou', 'page[number]': 3 } };
          const request2 = { query: { 'page[number]': 3 } };
          const request3 = { query: { 'page[size]': null, 'page[number]': 3 } };

          // when
          await missionsController.findMissions(request0, hFake);
          await missionsController.findMissions(request1, hFake);
          await missionsController.findMissions(request2, hFake);
          await missionsController.findMissions(request3, hFake);

          // then
          expect(findAllMissions).toHaveBeenNthCalledWith(1, { filter, page: { number: 3, size: 10 } });
          expect(findAllMissions).toHaveBeenNthCalledWith(2, { filter, page: { number: 3, size: 10 } });
          expect(findAllMissions).toHaveBeenNthCalledWith(3, { filter, page: { number: 3, size: 10 } });
          expect(findAllMissions).toHaveBeenNthCalledWith(4, { filter, page: { number: 3, size: 10 } });
        });

        it('should ceil page.size value to max value when it overflows', async function() {
          // given
          const request0 = { query: { 'page[size]': 100, 'page[number]': 3 } };
          const request1 = { query: { 'page[size]': 101, 'page[number]': 3 } };

          // when
          await missionsController.findMissions(request0, hFake);
          await missionsController.findMissions(request1, hFake);

          // then
          expect(findAllMissions).toHaveBeenNthCalledWith(1, { filter, page: { number: 3, size: 100 } });
          expect(findAllMissions).toHaveBeenNthCalledWith(2, { filter, page: { number: 3, size: 100 } });
        });
      });

      context('page number', function() {

        it('should use default page.number default value when it is not a positive integer', async function() {
          // given
          const request0 = { query: { 'page[size]': 5, 'page[number]': -3 } };
          const request1 = { query: { 'page[size]': 5, 'page[number]': 'coucou' } };
          const request2 = { query: { 'page[size]': 5 } };
          const request3 = { query: { 'page[size]': 5, 'page[number]': null } };

          // when
          await missionsController.findMissions(request0, hFake);
          await missionsController.findMissions(request1, hFake);
          await missionsController.findMissions(request2, hFake);
          await missionsController.findMissions(request3, hFake);

          // then
          expect(findAllMissions).toHaveBeenNthCalledWith(1, { filter, page: { number: 1, size: 5 } });
          expect(findAllMissions).toHaveBeenNthCalledWith(2, { filter, page: { number: 1, size: 5 } });
          expect(findAllMissions).toHaveBeenNthCalledWith(3, { filter, page: { number: 1, size: 5 } });
          expect(findAllMissions).toHaveBeenNthCalledWith(4, { filter, page: { number: 1, size: 5 } });
        });
      });

    });

    describe('filter normalization', function() {
      const page = { number: 1, size: 10 };

      it('ignore unknown filter parameters', async function() {
        // given
        const request = { query: { 'filter[statuses][]': 'VALIDATED', 'filter[damn]': 'ok' } };

        // when
        await missionsController.findMissions(request, hFake);

        // then
        expect(findAllMissions).toHaveBeenCalledWith({ filter: { statuses: ['VALIDATED'] }, page });
      });
    });
  });

  describe('createMission', function() {
    let createMissionMock;
    const attributes = {
      name: 'Mission impossible',
      'competence-id': 'AZERTY',
      status: Mission.status.INACTIVE,
      'learning-objectives': null,
      'validated-objectives': 'Très bien',
      'thematic-id': null
    };

    const request = { payload: { data: { attributes } } };

    beforeEach(function() {
      createMissionMock = vi.spyOn(usecases, 'createMission');
      createMissionMock.mockResolvedValue(new Mission({
        id: 1
      }));
    });

    it('should call the usecase with a domain object', async function() {
      // given

      // when
      await missionsController.create(request, hFake);

      const deserializedMission = new Mission({
        name_i18n: { fr: 'Mission impossible' },
        competenceId: 'AZERTY',
        thematicId: null,
        learningObjectives_i18n: { fr: null },
        validatedObjectives_i18n: { fr: 'Très bien' },
        status: Mission.status.INACTIVE,
      });
      // then
      expect(createMissionMock).toHaveBeenCalledWith(deserializedMission);
    });

    it('should return the serialized mission id', async function() {
      // when
      const result = await missionsController.create(request, hFake);

      // then
      expect(result.source.data).to.deep.equal(
        {
          type: 'missions',
          id: '1',
        }
      );
    });
  });
  describe('updateMission', function() {
    let updateMissionMock;
    const attributes = {
      name: 'Mission possible',
      'competence-id': 'QWERTY',
      status: Mission.status.VALIDATED,
      'learning-objectives': 'apprendre à éviter les lasers',
      'validated-objectives': 'Très bien',
      'thematic-id': null
    };

    const missionId = 1;
    const request = { payload: { data: { attributes } }, params: { id: missionId } };

    beforeEach(function() {
      updateMissionMock = vi.spyOn(usecases, 'updateMission');
      updateMissionMock.mockResolvedValue(new Mission({
        id: missionId
      }));
    });

    it('should call the usecase with a domain object', async function() {
      // given

      // when
      await missionsController.update(request, hFake);

      const deserializedMission = new Mission({
        id: missionId,
        name_i18n: { fr: 'Mission possible' },
        competenceId: 'QWERTY',
        thematicId: null,
        learningObjectives_i18n: { fr: 'apprendre à éviter les lasers' },
        validatedObjectives_i18n: { fr: 'Très bien' },
        status: Mission.status.VALIDATED,
      });
      // then
      expect(updateMissionMock).toHaveBeenCalledWith(deserializedMission);
    });

    it('should return the serialized mission id', async function() {
      // when
      const result = await missionsController.update(request, hFake);

      // then
      expect(result.source.data).to.deep.equal(
        {
          type: 'missions',
          id: '1',
        }
      );
    });
  });
});
