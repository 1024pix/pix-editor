const { expect, sinon, hFake } = require('../../../test-helper');
const staticCourseController = require('../../../../lib/application/static-courses/static-courses');
const staticCourseRepository = require('../../../../lib/infrastructure/repositories/static-course-repository');

describe('Unit | Controller | static courses controller', () => {
  describe('#findStaticCourseSummaries', function() {
    describe('pagination normalization', function() {
      let stub;
      beforeEach(function() {
        stub = sinon.stub(staticCourseRepository, 'findStaticCourses');
        stub.resolves({ results: [], meta: {} });
      });

      it('should pass along pagination from query params when all is valid', async function() {
        // given
        const request = { query: { 'page[size]': 5, 'page[number]': 3 } };

        // when
        await staticCourseController.findStaticCourseSummaries(request, hFake);

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
        await staticCourseController.findStaticCourseSummaries(request0, hFake);
        await staticCourseController.findStaticCourseSummaries(request1, hFake);
        await staticCourseController.findStaticCourseSummaries(request2, hFake);
        await staticCourseController.findStaticCourseSummaries(request3, hFake);

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
        await staticCourseController.findStaticCourseSummaries(request0, hFake);
        await staticCourseController.findStaticCourseSummaries(request1, hFake);

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
        await staticCourseController.findStaticCourseSummaries(request0, hFake);
        await staticCourseController.findStaticCourseSummaries(request1, hFake);
        await staticCourseController.findStaticCourseSummaries(request2, hFake);
        await staticCourseController.findStaticCourseSummaries(request3, hFake);

        // then
        expect(stub.getCall(0)).to.have.been.calledWithExactly({ page: { number: 1, size: 5 } });
        expect(stub.getCall(1)).to.have.been.calledWithExactly({ page: { number: 1, size: 5 } });
        expect(stub.getCall(2)).to.have.been.calledWithExactly({ page: { number: 1, size: 5 } });
        expect(stub.getCall(3)).to.have.been.calledWithExactly({ page: { number: 1, size: 5 } });
      });
    });
  });
});
