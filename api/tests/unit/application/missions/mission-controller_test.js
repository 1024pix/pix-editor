import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { hFake } from '../../../test-helper.js';
import * as missionsController from '../../../../lib/application/missions/mission-controller.js';
import * as usecases from '../../../../lib/domain/usecases/find-all-missions.js';
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
              status: Mission.status.ACTIVE,
              createdAt: new Date('2010-01-04'),
            })],
          meta: {}
        });
    });

    it('should call the repository with all query params when they are valid', async function() {
      // given
      const request = { query: { 'page[size]': 5, 'page[number]': 3, 'filter[isActive]': 'true' } };

      // when
      await missionsController.findMissions(request, hFake);

      // then
      expect(findAllMissions).toHaveBeenCalledWith({ filter: { isActive: true }, page: { number: 3, size: 5 } });
    });
    it('should return the serialized mission with french translations', async function() {
      // given
      const request = { query: { 'page[size]': 5, 'page[number]': 3, 'filter[isActive]': 'true' } };

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
            status: 'ACTIVE'
          }
        }
      ]);
    });

    describe('pagination', function() {
      const filter = { isActive: false };

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
        const request = { query: { 'filter[isActive]': 'true', 'filter[damn]': 'ok' } };

        // when
        await missionsController.findMissions(request, hFake);

        // then
        expect(findAllMissions).toHaveBeenCalledWith({ filter: { isActive: true }, page });
      });

      context('filter isActive', function() {
        it('extract isActive parameter correctly', async function() {
          // given
          const request0 = { query: { 'filter[isActive]': 3 } };
          const request1 = { query: { 'filter[isActive]': 'ok' } };
          const request2 = { query: { 'filter[somethingElse]': 'coucou' } };
          const request3 = { query: { 'filter[isActive]': 'true' } };
          const request4 = { query: { 'filter[isActive]': 'false' } };
          const request5 = { query: { 'filter[isActive]': '' } };

          // when
          await missionsController.findMissions(request0, hFake);
          await missionsController.findMissions(request1, hFake);
          await missionsController.findMissions(request2, hFake);
          await missionsController.findMissions(request3, hFake);
          await missionsController.findMissions(request4, hFake);
          await missionsController.findMissions(request5, hFake);

          // then
          expect(findAllMissions).toHaveBeenNthCalledWith(1, { filter: { isActive: false }, page });
          expect(findAllMissions).toHaveBeenNthCalledWith(2, { filter: { isActive: false }, page });
          expect(findAllMissions).toHaveBeenNthCalledWith(3, { filter: { isActive: false }, page });
          expect(findAllMissions).toHaveBeenNthCalledWith(4, { filter: { isActive: true }, page });
          expect(findAllMissions).toHaveBeenNthCalledWith(5, { filter: { isActive: false }, page });
          expect(findAllMissions).toHaveBeenNthCalledWith(6, { filter: { isActive: false }, page });
        });
      });
    });
  });
});
