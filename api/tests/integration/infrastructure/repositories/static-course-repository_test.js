import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { databaseBuilder, domainBuilder } from '../../../test-helper.js';
import { findReadSummaries, getRead } from '../../../../lib/infrastructure/repositories/static-course-repository.js';
import { challengeDatasource, skillDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';

describe('Integration | Repository | static-course-repository', function() {
  context('#findReadSummaries', function() {
    context('filter', function() {
      context('isActive', function() {
        const page = { number: 1, size: 20 };

        context('with results', function() {
          beforeEach(function() {
            // 4 Static courses
            [new Date('2010-01-01'), new Date('2011-01-01'),
              new Date('2012-01-01'), new Date('2013-01-01'),]
              .map((createdAt, index) => {
                databaseBuilder.factory.buildStaticCourse({
                  id: `courseId${index}`,
                  isActive: index % 2 === 0, // pair actif, impair inactif
                  createdAt,
                });
              });
            return databaseBuilder.commit();
          });
          it('should return all the static courses regardless of the isActive value when isActive filter is null', async function() {
            // given
            const filter = { isActive: null };

            // when
            const {
              results: actualStaticCourseSummaries,
              meta
            } = await findReadSummaries({ filter, page });

            // then
            const actualStaticCourseSummaryIds = actualStaticCourseSummaries.map(({ id }) => id);
            expect(actualStaticCourseSummaryIds).toEqual(['courseId3', 'courseId2', 'courseId1', 'courseId0']);
            expect(meta).to.deep.equal({
              page: 1,
              pageSize: 20,
              rowCount: 4,
              pageCount: 1,
            });
          });

          it('should return active static courses when isActive filter is true', async function() {
            // given
            const filter = { isActive: true };

            // when
            const {
              results: actualStaticCourseSummaries,
              meta
            } = await findReadSummaries({ filter, page });

            // then
            const actualStaticCourseSummaryIds = actualStaticCourseSummaries.map(({ id }) => id);
            expect(actualStaticCourseSummaryIds).toEqual(['courseId2', 'courseId0']);
            expect(meta).to.deep.equal({
              page: 1,
              pageSize: 20,
              rowCount: 2,
              pageCount: 1,
            });
          });

          it('should return inactive static courses when isActive filter is false', async function() {
            // given
            const filter = { isActive: false };

            // when
            const {
              results: actualStaticCourseSummaries,
              meta
            } = await findReadSummaries({ filter, page });

            // then
            const actualStaticCourseSummaryIds = actualStaticCourseSummaries.map(({ id }) => id);
            expect(actualStaticCourseSummaryIds).toEqual(['courseId3', 'courseId1']);
            expect(meta).to.deep.equal({
              page: 1,
              pageSize: 20,
              rowCount: 2,
              pageCount: 1,
            });
          });
        });

        context('no results', function() {
          beforeEach(function() {
            // 4 Static courses
            [new Date('2010-01-01'), new Date('2011-01-01'),
              new Date('2012-01-01'), new Date('2013-01-01'),]
              .map((createdAt, index) => {
                databaseBuilder.factory.buildStaticCourse({
                  id: `courseId${index}`,
                  isActive: true,
                  createdAt,
                });
              });
            return databaseBuilder.commit();
          });

          it('should return an empty result when no static course matches the isActive filter', async function() {
            // given
            const filter = { isActive: false };

            // when
            const {
              results: actualStaticCourseSummaries,
              meta
            } = await findReadSummaries({ filter, page });

            // then
            expect(actualStaticCourseSummaries).to.be.deep.equal([]);
            expect(meta).to.deep.equal({
              page: 1,
              pageSize: 20,
              rowCount: 0,
              pageCount: 0,
            });
          });
        });
      });
    });
  });

  context('#getRead', function() {
    it('should return the static course', async function() {
      //given
      databaseBuilder.factory.buildStaticCourse({
        id: 'rec123',
        challengeIds: 'challengeA,challengeB',
      });
      const airtableChallenges = [
        domainBuilder.buildChallengeDatasourceObject({
          id: 'challengeA',
          instruction: 'instructionA',
          status: 'A',
          skillId: 'skillA',
          preview: 'site/challenges/challengeA',
        }),
        domainBuilder.buildChallengeDatasourceObject({
          id: 'challengeB',
          instruction: 'instructionB',
          status: 'B',
          skillId: 'skillB',
          preview: 'site/challenges/challengeB',
        }),
      ];
      const stubFilterChallengeDatasource = vi.spyOn(challengeDatasource, 'filter').mockResolvedValue(airtableChallenges);
      const stubFilterSkillDatasource = vi.spyOn(skillDatasource, 'filter').mockResolvedValue([
        { id: 'skillA', name: '@skillA' }, { id: 'skillB', name: '@skillB' }
      ]);
      await databaseBuilder.commit();

      //when
      const staticCourse = await getRead('rec123');

      //then
      expect(staticCourse.id).to.equal('rec123');
      expect(stubFilterChallengeDatasource).toHaveBeenCalledWith({ filter: { ids: ['challengeA', 'challengeB'] } });
      expect(stubFilterSkillDatasource).toHaveBeenCalledWith({ filter: { ids: ['skillA', 'skillB'] } });
    });
  });
});

