const { expect, databaseBuilder, domainBuilder, sinon } = require('../../../test-helper');
const staticCourseRepository = require('../../../../lib/infrastructure/repositories/static-course-repository');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');

describe('Integration | Repository | static-course-repository', function() {
  describe('#findReadSummaries', function() {
    describe('pagination', function() {
      beforeEach(function() {
        // 8 Static courses
        [new Date('2010-01-01'), new Date('2011-01-01'),
          new Date('2012-01-01'), new Date('2013-01-01'),
          new Date('2014-01-01'), new Date('2015-01-01'),
          new Date('2016-01-01'), new Date('2017-01-01')]
          .map((createdAt, index) => {
            databaseBuilder.factory.buildStaticCourse({
              id: `courseId${index}`,
              createdAt,
            });
          });
        return databaseBuilder.commit();
      });

      it('should return the static courses and the appropriate meta pagination data that are within the pagination constraints', async function() {
        // given
        const page = { number: 2, size: 3 };

        // when
        const {
          results: actualStaticCourseSummaries,
          meta
        } = await staticCourseRepository.findReadSummaries({ page });

        // then
        const actualStaticCourseSummaryIds = actualStaticCourseSummaries.map(({ id }) => id);
        expect(actualStaticCourseSummaryIds).to.deepEqualArray(['courseId4', 'courseId3', 'courseId2']);
        expect(meta).to.deep.equal({
          page: 2,
          pageSize: 3,
          rowCount: 8,
          pageCount: 3,
        });
      });

      it('should return an empty array and the appropriate meta pagination data when pagination goes over the static courses total count', async function() {
        // given
        const page = { number: 5, size: 3 };

        // when
        const {
          results: actualStaticCourseSummaries,
          meta
        } = await staticCourseRepository.findReadSummaries({ page });

        // then
        expect(actualStaticCourseSummaries).to.be.deep.equal([]);
        expect(meta).to.deep.equal({
          page: 5,
          pageSize: 3,
          rowCount: 8,
          pageCount: 3,
        });
      });
    });
  });

  describe('#getRead', function() {
    it('should return the static course', async function() {
      //given
      databaseBuilder.factory.buildStaticCourse({
        id: 'rec123',
        challengeIds: 'challengeA,challengeB',
      });
      const airtableChallenges = [
        domainBuilder.buildChallengeAirtableDataObject({
          id: 'challengeA',
          instruction: 'instructionA',
          status: 'A',
          skillId: 'skillA',
          preview: 'site/challenges/challengeA',
        }),
        domainBuilder.buildChallengeAirtableDataObject({
          id: 'challengeB',
          instruction: 'instructionB',
          status: 'B',
          skillId: 'skillB',
          preview: 'site/challenges/challengeB',
        }),
      ];
      const stubFilterChallengeDatasource = sinon.stub(challengeDatasource, 'filter');
      stubFilterChallengeDatasource.withArgs({ filter: { ids: ['challengeA', 'challengeB'] } }).resolves(airtableChallenges);
      const stubFilterSkillDatasource = sinon.stub(skillDatasource, 'filter');
      stubFilterSkillDatasource.withArgs({ filter: { ids: ['skillA', 'skillB'] } }).resolves([
        { id: 'skillA', name: '@skillA' }, { id: 'skillB', name: '@skillB' }
      ]);
      await databaseBuilder.commit();

      //when
      const staticCourse = await staticCourseRepository.getRead('rec123');

      //then
      expect(staticCourse.id).to.equal('rec123');
    });
  });
});

