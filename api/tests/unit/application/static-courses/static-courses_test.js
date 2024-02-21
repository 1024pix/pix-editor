import { afterEach, beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { catchErr, domainBuilder, hFake } from '../../../test-helper.js';
import * as staticCourseController from '../../../../lib/application/static-courses/static-courses.js';
import {
  localizedChallengeRepository,
  staticCourseRepository
} from '../../../../lib/infrastructure/repositories/index.js';
import * as idGenerator from '../../../../lib/infrastructure/utils/id-generator.js';
import { InvalidStaticCourseCreationOrUpdateError } from '../../../../lib/domain/errors.js';

describe('Unit | Controller | static courses controller', function() {
  describe('findSummaries', function() {
    describe('pagination normalization', function() {
      let stub;
      const filter = { isActive: null, name: null };

      beforeEach(function() {
        stub = vi.spyOn(staticCourseRepository, 'findReadSummaries');
        stub.mockResolvedValue({ results: [], meta: {} });
      });

      it('should pass along pagination from query params when all is valid', async function() {
        // given
        const request = { query: { 'page[size]': 5, 'page[number]': 3 } };

        // when
        await staticCourseController.findSummaries(request, hFake);

        // then
        expect(stub).toHaveBeenCalledWith({ filter, page: { number: 3, size: 5 } });
      });

      it('ignore unknown pagination parameters', async function() {
        // given
        const request = { query: { 'page[size]': 5, 'page[number]': 3, 'page[hello]': 'oui' } };

        // when
        await staticCourseController.findSummaries(request, hFake);

        // then
        expect(stub).toHaveBeenCalledWith({ filter, page: { number: 3, size: 5 } });
      });

      context('page size', function() {

        it('should use default page.size default value when it is not a positive integer', async function() {
          // given
          const request0 = { query: { 'page[size]': -5, 'page[number]': 3 } };
          const request1 = { query: { 'page[size]': 'coucou', 'page[number]': 3 } };
          const request2 = { query: { 'page[number]': 3 } };
          const request3 = { query: { 'page[size]': null, 'page[number]': 3 } };

          // when
          await staticCourseController.findSummaries(request0, hFake);
          await staticCourseController.findSummaries(request1, hFake);
          await staticCourseController.findSummaries(request2, hFake);
          await staticCourseController.findSummaries(request3, hFake);

          // then
          expect(stub).toHaveBeenNthCalledWith(1, { filter, page: { number: 3, size: 10 } });
          expect(stub).toHaveBeenNthCalledWith(2, { filter, page: { number: 3, size: 10 } });
          expect(stub).toHaveBeenNthCalledWith(3, { filter, page: { number: 3, size: 10 } });
          expect(stub).toHaveBeenNthCalledWith(4, { filter, page: { number: 3, size: 10 } });
        });

        it('should ceil page.size value to max value when it overflows', async function() {
          // given
          const request0 = { query: { 'page[size]': 100, 'page[number]': 3 } };
          const request1 = { query: { 'page[size]': 101, 'page[number]': 3 } };

          // when
          await staticCourseController.findSummaries(request0, hFake);
          await staticCourseController.findSummaries(request1, hFake);

          // then
          expect(stub).toHaveBeenNthCalledWith(1, { filter, page: { number: 3, size: 100 } });
          expect(stub).toHaveBeenNthCalledWith(2, { filter, page: { number: 3, size: 100 } });
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
          await staticCourseController.findSummaries(request0, hFake);
          await staticCourseController.findSummaries(request1, hFake);
          await staticCourseController.findSummaries(request2, hFake);
          await staticCourseController.findSummaries(request3, hFake);

          // then
          expect(stub).toHaveBeenNthCalledWith(1, { filter, page: { number: 1, size: 5 } });
          expect(stub).toHaveBeenNthCalledWith(2, { filter, page: { number: 1, size: 5 } });
          expect(stub).toHaveBeenNthCalledWith(3, { filter, page: { number: 1, size: 5 } });
          expect(stub).toHaveBeenNthCalledWith(4, { filter, page: { number: 1, size: 5 } });
        });
      });

    });

    describe('filter normalization', function() {
      let stub;
      const page = { number: 1, size: 10 };
      beforeEach(function() {
        stub = vi.spyOn(staticCourseRepository, 'findReadSummaries');
        stub.mockResolvedValue({ results: [], meta: {} });
      });

      it('should pass along filter from query params when all is valid', async function() {
        // given
        const request = { query: { 'filter[isActive]': 'true', 'filter[name]': 'Laura' } };

        // when
        await staticCourseController.findSummaries(request, hFake);

        // then
        expect(stub).toHaveBeenCalledWith({ filter: { isActive: true, name: 'Laura' }, page });
      });

      it('ignore unknown filter parameters', async function() {
        // given
        const request = { query: { 'filter[isActive]': 'true', 'filter[damn]': 'ok' } };

        // when
        await staticCourseController.findSummaries(request, hFake);

        // then
        expect(stub).toHaveBeenCalledWith({ filter: { isActive: true, name: null }, page });
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
          await staticCourseController.findSummaries(request0, hFake);
          await staticCourseController.findSummaries(request1, hFake);
          await staticCourseController.findSummaries(request2, hFake);
          await staticCourseController.findSummaries(request3, hFake);
          await staticCourseController.findSummaries(request4, hFake);
          await staticCourseController.findSummaries(request5, hFake);

          // then
          expect(stub).toHaveBeenNthCalledWith(1, { filter: { isActive: false, name: null }, page });
          expect(stub).toHaveBeenNthCalledWith(2, { filter: { isActive: false, name: null }, page });
          expect(stub).toHaveBeenNthCalledWith(3, { filter: { isActive: null, name: null }, page });
          expect(stub).toHaveBeenNthCalledWith(4, { filter: { isActive: true, name: null }, page });
          expect(stub).toHaveBeenNthCalledWith(5, { filter: { isActive: false, name: null }, page });
          expect(stub).toHaveBeenNthCalledWith(6, { filter: { isActive: null, name: null }, page });
        });
      });
      context('filter name', function() {
        it('extract name parameter correctly', async function() {
          // given
          const request0 = { query: { 'filter[name]': 3 } };
          const request1 = { query: { 'filter[name]': 'ok' } };
          const request2 = { query: { 'filter[somethingElse]': 'coucou' } };
          const request3 = { query: { 'filter[name]': '' } };

          // when
          await staticCourseController.findSummaries(request0, hFake);
          await staticCourseController.findSummaries(request1, hFake);
          await staticCourseController.findSummaries(request2, hFake);
          await staticCourseController.findSummaries(request3, hFake);

          // then
          expect(stub).toHaveBeenNthCalledWith(1, { filter: { isActive: null, name: '3' }, page });
          expect(stub).toHaveBeenNthCalledWith(2, { filter: { isActive: null, name: 'ok' }, page });
          expect(stub).toHaveBeenNthCalledWith(3, { filter: { isActive: null, name: null }, page });
          expect(stub).toHaveBeenNthCalledWith(4, { filter: { isActive: null, name: null }, page });
        });
      });
    });
  });
  describe('create', function() {

    describe('creationCommand normalization', function() {
      let saveStub, getReadStub, getManyStub, generateNewIdStub;

      beforeEach(function() {
        vi.useFakeTimers({
          now: new Date('2021-10-29T03:04:00Z'),
        });
        getManyStub = vi.spyOn(localizedChallengeRepository, 'getMany');
        getManyStub.mockResolvedValue([{ id: 'chalA' }]);
        saveStub = vi.spyOn(staticCourseRepository, 'save');
        saveStub.mockResolvedValue('course123');
        getReadStub = vi.spyOn(staticCourseRepository, 'getRead');
        getReadStub.mockResolvedValue({});
        generateNewIdStub = vi.spyOn(idGenerator, 'generateNewId');
        generateNewIdStub.mockReturnValue('courseDEF456');
      });

      afterEach(function() {
        vi.useRealTimers();
      });

      it('should pass along creation command from attributes when all is valid', async function() {
        // given
        const request = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name  ',
            description: '  some valid description',
            'challenge-ids': ['chalA'],
          } } } };

        // when
        await staticCourseController.create(request, hFake);

        // then
        const expectedStaticCourse = domainBuilder.buildStaticCourse({
          id: 'courseDEF456',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalA'],
          createdAt: new Date('2021-10-29T03:04:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).toHaveBeenCalledWith(expectedStaticCourse);
      });

      it('should normalize name to an empty string when not a string, and thus throw an error', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: null,
            description: '  some valid description',
            'challenge-ids': ['chalA'],
          } } } };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            description: '  some valid description',
            'challenge-ids': ['chalA'],
          } } } };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 123,
            description: '  some valid description',
            'challenge-ids': ['chalA'],
          } } } };

        // when
        const error0 = await catchErr(staticCourseController.create)(request0, hFake);
        const error1 = await catchErr(staticCourseController.create)(request1, hFake);
        const error2 = await catchErr(staticCourseController.create)(request2, hFake);

        // then
        expect(error0).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error0.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(error1).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error1.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(error2).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error2.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(saveStub).not.toHaveBeenCalled();
      });

      it('should normalize description to an empty string when not a string', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: null,
            'challenge-ids': ['chalA'],
          } } } };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            'challenge-ids': ['chalA'],
          } } } };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 123,
            'challenge-ids': ['chalA'],
          } } } };

        // when
        await staticCourseController.create(request0, hFake);
        await staticCourseController.create(request1, hFake);
        await staticCourseController.create(request2, hFake);

        // then
        const expectedStaticCourse = domainBuilder.buildStaticCourse({
          id: 'courseDEF456',
          name: 'some valid name',
          description: '',
          challengeIds: ['chalA'],
          createdAt: new Date('2021-10-29T03:04:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).toHaveBeenNthCalledWith(1, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(2, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(3, expectedStaticCourse);
      });

      it('should normalize challengeIds to an empty array when not an array, and thus throw an error', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
            challengeIds: 'coucou',
          } } } };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
            challengeIds: null,
          } } } };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
          } } } };
        const request3 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
            challengeIds: 123,
          } } } };

        // when
        const error0 = await catchErr(staticCourseController.create)(request0, hFake);
        const error1 = await catchErr(staticCourseController.create)(request1, hFake);
        const error2 = await catchErr(staticCourseController.create)(request2, hFake);
        const error3 = await catchErr(staticCourseController.create)(request3, hFake);

        // then
        expect(error0).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error0.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error1).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error1.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error2).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error2.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error3).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error3.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(saveStub).not.toHaveBeenCalled();
      });
    });
  });
  describe('update', function() {

    describe('updateCommand normalization', function() {
      let saveStub, getReadStub, getManyStub, getStub;

      beforeEach(function() {
        vi.useFakeTimers({
          now: new Date('2021-10-29T03:04:00Z'),
        });
        getManyStub = vi.spyOn(localizedChallengeRepository, 'getMany');
        getManyStub.mockResolvedValue([{ id: 'chalA' }]);
        saveStub = vi.spyOn(staticCourseRepository, 'save');
        saveStub.mockResolvedValue();
        getStub = vi.spyOn(staticCourseRepository, 'get');
        getStub.mockResolvedValue(domainBuilder.buildStaticCourse({
          id: 'someCourseId',
          createdAt: new Date('2020-01-01T00:00:01Z'),
        }));
        getReadStub = vi.spyOn(staticCourseRepository, 'getRead');
        getReadStub.mockResolvedValue({});
      });

      afterEach(function() {
        vi.useRealTimers();
      });

      it('should pass along update command from attributes when all is valid', async function() {
        // given
        const request = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name  ',
            description: '  some valid description',
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };

        // when
        await staticCourseController.update(request, hFake);

        // then
        const expectedStaticCourse = domainBuilder.buildStaticCourse({
          id: 'someCourseId',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalA'],
          createdAt: new Date('2020-01-01T00:00:01Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).toHaveBeenCalledWith(expectedStaticCourse);
      });

      it('should normalize name to an empty string when not a string, and thus throw an error', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: null,
            description: '  some valid description',
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            description: '  some valid description',
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 123,
            description: '  some valid description',
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };

        // when
        const error0 = await catchErr(staticCourseController.update)(request0, hFake);
        const error1 = await catchErr(staticCourseController.update)(request1, hFake);
        const error2 = await catchErr(staticCourseController.update)(request2, hFake);

        // then
        expect(error0).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error0.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(error1).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error1.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(error2).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error2.errors[0]).to.deep.equal({ field: 'name', code: 'MANDATORY_FIELD' });
        expect(saveStub).not.toHaveBeenCalled();
      });

      it('should normalize description to an empty string when not a string', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: null,
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 123,
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };

        // when
        await staticCourseController.update(request0, hFake);
        await staticCourseController.update(request1, hFake);
        await staticCourseController.update(request2, hFake);

        // then
        const expectedStaticCourse = domainBuilder.buildStaticCourse({
          id: 'someCourseId',
          name: 'some valid name',
          description: '',
          challengeIds: ['chalA'],
          createdAt: new Date('2020-01-01T00:00:01Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).toHaveBeenNthCalledWith(1, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(2, expectedStaticCourse);
        expect(saveStub).toHaveBeenNthCalledWith(3, expectedStaticCourse);
      });

      it('should normalize challengeIds to an empty array when not an array, and thus throw an error', async function() {
        // given
        const request0 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
            challengeIds: 'coucou',
          } } },
          params: { id: 'someCourseId' } };
        const request1 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
            challengeIds: null,
          } } },
          params: { id: 'someCourseId' } };
        const request2 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
          } } },
          params: { id: 'someCourseId' } };
        const request3 = {
          url: { host: 'host.site', protocol: 'http:' },
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
            challengeIds: 123,
          } } },
          params: { id: 'someCourseId' } };

        // when
        const error0 = await catchErr(staticCourseController.update)(request0, hFake);
        const error1 = await catchErr(staticCourseController.update)(request1, hFake);
        const error2 = await catchErr(staticCourseController.update)(request2, hFake);
        const error3 = await catchErr(staticCourseController.update)(request3, hFake);

        // then
        expect(error0).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error0.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error1).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error1.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error2).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error2.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(error3).to.be.instanceOf(InvalidStaticCourseCreationOrUpdateError);
        expect(error3.errors[0]).to.deep.equal({ field: 'challengeIds', code: 'MANDATORY_FIELD' });
        expect(saveStub).not.toHaveBeenCalled();
      });
    });
  });
});
