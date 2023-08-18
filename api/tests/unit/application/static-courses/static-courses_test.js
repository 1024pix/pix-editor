const { expect, sinon, hFake, domainBuilder, catchErr } = require('../../../test-helper');
const staticCourseController = require('../../../../lib/application/static-courses/static-courses');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const staticCourseRepository = require('../../../../lib/infrastructure/repositories/static-course-repository');
const idGenerator = require('../../../../lib/infrastructure/utils/id-generator');
const { InvalidStaticCourseCreationOrUpdateError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | static courses controller', function() {
  describe('findSummaries', function() {
    describe('pagination normalization', function() {
      let stub;
      const filter = { isActive: null };

      beforeEach(function() {
        stub = sinon.stub(staticCourseRepository, 'findReadSummaries');
        stub.resolves({ results: [], meta: {} });
      });

      it('should pass along pagination from query params when all is valid', async function() {
        // given
        const request = { query: { 'page[size]': 5, 'page[number]': 3 } };

        // when
        await staticCourseController.findSummaries(request, hFake);

        // then
        expect(stub).to.have.been.calledWithExactly({ filter, page: { number: 3, size: 5 } });
      });

      it('ignore unknown pagination parameters', async function() {
        // given
        const request = { query: { 'page[size]': 5, 'page[number]': 3, 'page[hello]': 'oui' } };

        // when
        await staticCourseController.findSummaries(request, hFake);

        // then
        expect(stub).to.have.been.calledWithExactly({ filter, page: { number: 3, size: 5 } });
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
          expect(stub.getCall(0)).to.have.been.calledWithExactly({ filter, page: { number: 3, size: 10 } });
          expect(stub.getCall(1)).to.have.been.calledWithExactly({ filter, page: { number: 3, size: 10 } });
          expect(stub.getCall(2)).to.have.been.calledWithExactly({ filter, page: { number: 3, size: 10 } });
          expect(stub.getCall(3)).to.have.been.calledWithExactly({ filter, page: { number: 3, size: 10 } });
        });

        it('should ceil page.size value to max value when it overflows', async function() {
          // given
          const request0 = { query: { 'page[size]': 100, 'page[number]': 3 } };
          const request1 = { query: { 'page[size]': 101, 'page[number]': 3 } };

          // when
          await staticCourseController.findSummaries(request0, hFake);
          await staticCourseController.findSummaries(request1, hFake);

          // then
          expect(stub.getCall(0)).to.have.been.calledWithExactly({ filter, page: { number: 3, size: 100 } });
          expect(stub.getCall(1)).to.have.been.calledWithExactly({ filter, page: { number: 3, size: 100 } });
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
          expect(stub.getCall(0)).to.have.been.calledWithExactly({ filter, page: { number: 1, size: 5 } });
          expect(stub.getCall(1)).to.have.been.calledWithExactly({ filter, page: { number: 1, size: 5 } });
          expect(stub.getCall(2)).to.have.been.calledWithExactly({ filter, page: { number: 1, size: 5 } });
          expect(stub.getCall(3)).to.have.been.calledWithExactly({ filter, page: { number: 1, size: 5 } });
        });
      });

    });

    describe('filter normalization', function() {
      let stub;
      const page = { number: 1, size: 10 };
      beforeEach(function() {
        stub = sinon.stub(staticCourseRepository, 'findReadSummaries');
        stub.resolves({ results: [], meta: {} });
      });

      it('should pass along filter from query params when all is valid', async function() {
        // given
        const request = { query: { 'filter[isActive]': 'true' } };

        // when
        await staticCourseController.findSummaries(request, hFake);

        // then
        expect(stub).to.have.been.calledWithExactly({ filter: { isActive: true }, page });
      });

      it('ignore unknown filter parameters', async function() {
        // given
        const request = { query: { 'filter[isActive]': 'true', 'filter[damn]': 'ok' } };

        // when
        await staticCourseController.findSummaries(request, hFake);

        // then
        expect(stub).to.have.been.calledWithExactly({ filter: { isActive: true }, page });
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
          expect(stub.getCall(0)).to.have.been.calledWithExactly({ filter: { isActive: false }, page });
          expect(stub.getCall(1)).to.have.been.calledWithExactly({ filter: { isActive: false }, page });
          expect(stub.getCall(2)).to.have.been.calledWithExactly({ filter: { isActive: null }, page });
          expect(stub.getCall(3)).to.have.been.calledWithExactly({ filter: { isActive: true }, page });
          expect(stub.getCall(4)).to.have.been.calledWithExactly({ filter: { isActive: false }, page });
          expect(stub.getCall(5)).to.have.been.calledWithExactly({ filter: { isActive: null }, page });
        });
      });
    });
  });
  describe('create', function() {

    describe('creationCommand normalization', function() {
      let saveStub, getReadStub, getAllIdsInStub, generateNewIdStub, clock;

      beforeEach(function() {
        clock = sinon.useFakeTimers(new Date('2021-10-29T03:04:00Z'));
        getAllIdsInStub = sinon.stub(challengeRepository, 'getAllIdsIn');
        getAllIdsInStub.resolves(['chalA']);
        saveStub = sinon.stub(staticCourseRepository, 'save');
        saveStub.resolves('course123');
        getReadStub = sinon.stub(staticCourseRepository, 'getRead');
        getReadStub.resolves({});
        generateNewIdStub = sinon.stub(idGenerator, 'generateNewId');
        generateNewIdStub.returns('courseDEF456');
      });

      afterEach(function() {
        clock.restore();
      });

      it('should pass along creation command from attributes when all is valid', async function() {
        // given
        const request = { payload: { data: { attributes: {
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
        expect(saveStub).to.have.been.calledWithExactly(expectedStaticCourse);
      });

      it('should normalize name to an empty string when not a string, and thus throw an error', async function() {
        // given
        const request0 = { payload: { data: { attributes: {
          name: null,
          description: '  some valid description',
          'challenge-ids': ['chalA'],
        } } } };
        const request1 = { payload: { data: { attributes: {
          description: '  some valid description',
          'challenge-ids': ['chalA'],
        } } } };
        const request2 = { payload: { data: { attributes: {
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
        expect(saveStub).to.not.have.been.called;
      });

      it('should normalize description to an empty string when not a string', async function() {
        // given
        const request0 = { payload: { data: { attributes: {
          name: 'some valid name',
          description: null,
          'challenge-ids': ['chalA'],
        } } } };
        const request1 = { payload: { data: { attributes: {
          name: 'some valid name',
          'challenge-ids': ['chalA'],
        } } } };
        const request2 = { payload: { data: { attributes: {
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
        expect(saveStub.getCall(0)).to.have.been.calledWithExactly(expectedStaticCourse);
        expect(saveStub.getCall(1)).to.have.been.calledWithExactly(expectedStaticCourse);
        expect(saveStub.getCall(2)).to.have.been.calledWithExactly(expectedStaticCourse);
      });

      it('should normalize challengeIds to an empty array when not an array, and thus throw an error', async function() {
        // given
        const request0 = { payload: { data: { attributes: {
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: 'coucou',
        } } } };
        const request1 = { payload: { data: { attributes: {
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: null,
        } } } };
        const request2 = { payload: { data: { attributes: {
          name: 'some valid name',
          description: 'some valid description',
        } } } };
        const request3 = { payload: { data: { attributes: {
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
        expect(saveStub).to.not.have.been.called;
      });
    });
  });
  describe('update', function() {

    describe('updateCommand normalization', function() {
      let saveStub, getReadStub, getAllIdsInStub, getStub, clock;

      beforeEach(function() {
        clock = sinon.useFakeTimers(new Date('2021-10-29T03:04:00Z'));
        getAllIdsInStub = sinon.stub(challengeRepository, 'getAllIdsIn');
        getAllIdsInStub.resolves(['chalA']);
        saveStub = sinon.stub(staticCourseRepository, 'save');
        saveStub.resolves();
        getStub = sinon.stub(staticCourseRepository, 'get');
        getStub.resolves(domainBuilder.buildStaticCourse({
          id: 'someCourseId',
          createdAt: new Date('2020-01-01T00:00:01Z'),
        }));
        getReadStub = sinon.stub(staticCourseRepository, 'getRead');
        getReadStub.resolves({});
      });

      afterEach(function() {
        clock.restore();
      });

      it('should pass along update command from attributes when all is valid', async function() {
        // given
        const request = {
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
        expect(saveStub).to.have.been.calledWithExactly(expectedStaticCourse);
      });

      it('should normalize name to an empty string when not a string, and thus throw an error', async function() {
        // given
        const request0 = {
          payload: { data: { attributes: {
            name: null,
            description: '  some valid description',
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };
        const request1 = {
          payload: { data: { attributes: {
            description: '  some valid description',
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };
        const request2 = {
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
        expect(saveStub).to.not.have.been.called;
      });

      it('should normalize description to an empty string when not a string', async function() {
        // given
        const request0 = {
          payload: { data: { attributes: {
            name: 'some valid name',
            description: null,
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };
        const request1 = {
          payload: { data: { attributes: {
            name: 'some valid name',
            'challenge-ids': ['chalA'],
          } } },
          params: { id: 'someCourseId' } };
        const request2 = {
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
        expect(saveStub.getCall(0)).to.have.been.calledWithExactly(expectedStaticCourse);
        expect(saveStub.getCall(1)).to.have.been.calledWithExactly(expectedStaticCourse);
        expect(saveStub.getCall(2)).to.have.been.calledWithExactly(expectedStaticCourse);
      });

      it('should normalize challengeIds to an empty array when not an array, and thus throw an error', async function() {
        // given
        const request0 = {
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
            challengeIds: 'coucou',
          } } },
          params: { id: 'someCourseId' } };
        const request1 = {
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
            challengeIds: null,
          } } },
          params: { id: 'someCourseId' } };
        const request2 = {
          payload: { data: { attributes: {
            name: 'some valid name',
            description: 'some valid description',
          } } },
          params: { id: 'someCourseId' } };
        const request3 = {
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
        expect(saveStub).to.not.have.been.called;
      });
    });
  });
});
