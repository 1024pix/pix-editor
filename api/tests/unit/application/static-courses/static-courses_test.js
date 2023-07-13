const { expect, sinon, hFake, domainBuilder, catchErr } = require('../../../test-helper');
const staticCourseController = require('../../../../lib/application/static-courses/static-courses');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const staticCourseRepository = require('../../../../lib/infrastructure/repositories/static-course-repository');
const idGenerator = require('../../../../lib/infrastructure/utils/id-generator');
const { InvalidStaticCourseCreationError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | static courses controller', function() {
  describe('findSummaries', function() {
    describe('pagination normalization', function() {
      let stub;
      beforeEach(function() {
        stub = sinon.stub(staticCourseRepository, 'findSummaries');
        stub.resolves({ results: [], meta: {} });
      });

      it('should pass along pagination from query params when all is valid', async function() {
        // given
        const request = { query: { 'page[size]': 5, 'page[number]': 3 } };

        // when
        await staticCourseController.findSummaries(request, hFake);

        // then
        expect(stub).to.have.been.calledWithExactly({ page: { number: 3, size: 5 } });
      });

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
        expect(stub.getCall(0)).to.have.been.calledWithExactly({ page: { number: 3, size: 10 } });
        expect(stub.getCall(1)).to.have.been.calledWithExactly({ page: { number: 3, size: 10 } });
        expect(stub.getCall(2)).to.have.been.calledWithExactly({ page: { number: 3, size: 10 } });
        expect(stub.getCall(3)).to.have.been.calledWithExactly({ page: { number: 3, size: 10 } });
      });

      it('should ceil page.size value to max value when it overflows', async function() {
        // given
        const request0 = { query: { 'page[size]': 100, 'page[number]': 3 } };
        const request1 = { query: { 'page[size]': 101, 'page[number]': 3 } };

        // when
        await staticCourseController.findSummaries(request0, hFake);
        await staticCourseController.findSummaries(request1, hFake);

        // then
        expect(stub.getCall(0)).to.have.been.calledWithExactly({ page: { number: 3, size: 100 } });
        expect(stub.getCall(1)).to.have.been.calledWithExactly({ page: { number: 3, size: 100 } });
      });

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
        expect(stub.getCall(0)).to.have.been.calledWithExactly({ page: { number: 1, size: 5 } });
        expect(stub.getCall(1)).to.have.been.calledWithExactly({ page: { number: 1, size: 5 } });
        expect(stub.getCall(2)).to.have.been.calledWithExactly({ page: { number: 1, size: 5 } });
        expect(stub.getCall(3)).to.have.been.calledWithExactly({ page: { number: 1, size: 5 } });
      });
    });
  });
  describe('create', function() {

    describe('creationCommand normalization', function() {
      let saveStub, getStub, getAllIdsInStub, generateNewIdStub, clock;

      beforeEach(function() {
        clock = sinon.useFakeTimers(new Date('2021-10-29T03:04:00Z'));
        getAllIdsInStub = sinon.stub(challengeRepository, 'getAllIdsIn');
        getAllIdsInStub.resolves(['chalA']);
        saveStub = sinon.stub(staticCourseRepository, 'save');
        saveStub.resolves('course123');
        getStub = sinon.stub(staticCourseRepository, 'get');
        getStub.resolves({});
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
        const expectedStaticCourseForCreation = domainBuilder.buildStaticCourse({
          id: 'courseDEF456',
          name: 'some valid name',
          description: 'some valid description',
          challengeIds: ['chalA'],
          createdAt: new Date('2021-10-29T03:04:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub).to.have.been.calledWithExactly(expectedStaticCourseForCreation);
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
        expect(error0).to.be.instanceOf(InvalidStaticCourseCreationError);
        expect(error0.message).to.equal('Invalid or empty "name"');
        expect(error1).to.be.instanceOf(InvalidStaticCourseCreationError);
        expect(error1.message).to.equal('Invalid or empty "name"');
        expect(error2).to.be.instanceOf(InvalidStaticCourseCreationError);
        expect(error2.message).to.equal('Invalid or empty "name"');
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
        const expectedStaticCourseForCreation = domainBuilder.buildStaticCourse({
          id: 'courseDEF456',
          name: 'some valid name',
          description: '',
          challengeIds: ['chalA'],
          createdAt: new Date('2021-10-29T03:04:00Z'),
          updatedAt: new Date('2021-10-29T03:04:00Z'),
        });
        expect(saveStub.getCall(0)).to.have.been.calledWithExactly(expectedStaticCourseForCreation);
        expect(saveStub.getCall(1)).to.have.been.calledWithExactly(expectedStaticCourseForCreation);
        expect(saveStub.getCall(2)).to.have.been.calledWithExactly(expectedStaticCourseForCreation);
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
        expect(error0).to.be.instanceOf(InvalidStaticCourseCreationError);
        expect(error0.message).to.equal('No challenges provided');
        expect(error1).to.be.instanceOf(InvalidStaticCourseCreationError);
        expect(error1.message).to.equal('No challenges provided');
        expect(error2).to.be.instanceOf(InvalidStaticCourseCreationError);
        expect(error2.message).to.equal('No challenges provided');
        expect(error3).to.be.instanceOf(InvalidStaticCourseCreationError);
        expect(error3.message).to.equal('No challenges provided');
        expect(saveStub).to.not.have.been.called;
      });
    });
  });
});
