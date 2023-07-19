const { expect, databaseBuilder, airtableBuilder, domainBuilder, sinon } = require('../../../test-helper');
const staticCourseRepository = require('../../../../lib/infrastructure/repositories/static-course-repository');
const courseDatasource = require('../../../../lib/infrastructure/datasources/airtable/course-datasource');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');

describe('Integration | Repository | static-course-repository', function() {
  describe('#findReadSummaries', function() {
    describe('pagination', function() {

      context('when there are duplicates', function() {
        it('should prioritize PG records over Airtable records', async function() {
          // given
          const onlyCourseInAirtable = airtableBuilder.factory.buildCourse({
            id: 'takenCourseId',
            name: 'from airtable',
          });
          airtableBuilder.mockLists({
            courses: [onlyCourseInAirtable],
          });
          databaseBuilder.factory.buildStaticCourse({
            id: 'takenCourseId',
            name: 'from PG',
          });
          await databaseBuilder.commit();
          const page = { number: 1, size: 3 };

          // when
          const { results: actualStaticCourseSummaries, meta } = await staticCourseRepository.findReadSummaries({ page });

          // then
          const actualStaticCourseSummaryNames = actualStaticCourseSummaries.map(({ name }) => name);
          expect(actualStaticCourseSummaryNames).to.deepEqualArray(['from PG']);
          expect(meta).to.deep.equal({
            page: 1,
            pageSize: 3,
            rowCount: 1,
            pageCount: 1,
          });
        });
      });

      context('when there are no duplicate', function() {
        beforeEach(function() {
          // 4 Static courses PG with even dates
          [new Date('2010-01-01'), new Date('2012-01-01'), new Date('2014-01-01'), new Date('2016-01-01')]
            .map((createdAt, index) => {
              databaseBuilder.factory.buildStaticCourse({
                id: `courseId${index}`,
                createdAt,
              });
            });
          // 4 Static courses Airtable with odd dates
          const airtableStaticCourses = [new Date('2009-01-01'), new Date('2011-01-01'), new Date('2013-01-01'), new Date('2015-01-01')]
            .map((createdAt, index) => {
              const airtableIndex = index + 4;
              return airtableBuilder.factory.buildCourse({
                id: `courseId${airtableIndex}`,
                createdAt,
              });
            });
          airtableBuilder.mockLists({
            courses: airtableStaticCourses,
          });
          return databaseBuilder.commit();
        });

        it('should return the static courses and the appropriate meta pagination data that are within the pagination constraints', async function() {
          // given
          const page = { number: 2, size: 3 };

          // when
          const { results: actualStaticCourseSummaries, meta } = await staticCourseRepository.findReadSummaries({ page });

          // then
          const actualStaticCourseSummaryIds = actualStaticCourseSummaries.map(({ id }) => id);
          expect(actualStaticCourseSummaryIds).to.deepEqualArray(['courseId6', 'courseId1', 'courseId5']);
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
          const { results: actualStaticCourseSummaries, meta } = await staticCourseRepository.findReadSummaries({ page });

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
  });

  describe('#getRead', function() {
    context('when the static course is in PG', function() {
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
          }),
          domainBuilder.buildChallengeAirtableDataObject({
            id: 'challengeB',
            instruction: 'instructionB',
            status: 'B',
            skillId: 'skillB',
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

    context('when the static course is in Airtable', function() {
      it('should return the static course', async function() {
        //given
        const airtableStaticCourse = domainBuilder.buildCourseAirtableDataObject({
          id: 'rec123',
          challenges: ['challengeA', 'challengeB'],
        });
        const airtableChallenges = [
          domainBuilder.buildChallengeAirtableDataObject({
            id: 'challengeA',
            instruction: 'instructionA',
            status: 'A',
            skillId: 'skillA',
          }),
          domainBuilder.buildChallengeAirtableDataObject({
            id: 'challengeB',
            instruction: 'instructionB',
            status: 'B',
            skillId: 'skillB',
          }),
        ];
        const stubFilterCourseDatasource = sinon.stub(courseDatasource, 'filter');
        stubFilterCourseDatasource.withArgs({ filter: { ids: ['rec123'] } }).resolves([airtableStaticCourse]);
        const stubFilterChallengeDatasource = sinon.stub(challengeDatasource, 'filter');
        stubFilterChallengeDatasource.withArgs({ filter: { ids: ['challengeA', 'challengeB'] } }).resolves(airtableChallenges);
        const stubFilterSkillDatasource = sinon.stub(skillDatasource, 'filter');
        stubFilterSkillDatasource.withArgs({ filter: { ids: ['skillA', 'skillB'] } }).resolves([
          { id: 'skillA', name: '@skillA' }, { id: 'skillB', name: '@skillB' }
        ]);

        //when
        const staticCourse = await staticCourseRepository.getRead('rec123');

        //then
        expect(staticCourse.id).to.equal('rec123');
      });
    });

    context('when the static course is neither in Airtable, nor in PG', function() {
      it('should return null', async function() {
        //given
        databaseBuilder.factory.buildStaticCourse({
          id: 'rec123',
        });
        await databaseBuilder.commit();
        const stubFilterCourseDatasource = sinon.stub(courseDatasource, 'filter');
        stubFilterCourseDatasource.withArgs({ filter: { ids: ['rec789'] } }).resolves([]);

        //when
        const staticCourse = await staticCourseRepository.getRead('rec789');
        //then
        expect(staticCourse).to.be.null;
      });
    });

    context('when the static course is both in Airtable and PG', function() {
      it('should return the one from PG first', async function() {
        //given
        const airtableStaticCourse = domainBuilder.buildCourseAirtableDataObject({
          id: 'rec123',
          name: 'Course FROM AIRTABLE',
          challenges: ['challengeA', 'challengeB'],
        });
        const airtableChallenges = [
          domainBuilder.buildChallengeAirtableDataObject({
            id: 'challengeA',
            instruction: 'instructionA',
            status: 'A',
            skillId: 'skillA',
          }),
          domainBuilder.buildChallengeAirtableDataObject({
            id: 'challengeB',
            instruction: 'instructionB',
            status: 'B',
            skillId: 'skillB',
          }),
        ];
        const stubFilterCourseDatasource = sinon.stub(courseDatasource, 'filter');
        stubFilterCourseDatasource.withArgs({ filter: { ids: ['rec123'] } }).resolves([airtableStaticCourse]);
        const stubFilterChallengeDatasource = sinon.stub(challengeDatasource, 'filter');
        stubFilterChallengeDatasource.withArgs({ filter: { ids: ['challengeA', 'challengeB'] } }).resolves(airtableChallenges);
        const stubFilterSkillDatasource = sinon.stub(skillDatasource, 'filter');
        stubFilterSkillDatasource.withArgs({ filter: { ids: ['skillA', 'skillB'] } }).resolves([
          { id: 'skillA', name: '@skillA' }, { id: 'skillB', name: '@skillB' }
        ]);
        databaseBuilder.factory.buildStaticCourse({
          id: 'rec123',
          name: 'Course FROM PG',
          challengeIds: 'challengeA,challengeB',
        });
        await databaseBuilder.commit();

        //when
        const staticCourse = await staticCourseRepository.get('rec123');

        //then
        expect(staticCourse.id).to.equal('rec123');
        expect(staticCourse.name).to.equal('Course FROM PG');
      });
    });
  });
});

