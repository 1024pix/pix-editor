import { beforeEach, describe, describe as context, expect, it, vi } from 'vitest';
import { databaseBuilder, domainBuilder } from '../../../test-helper.js';
import { findReadSummaries, getRead } from '../../../../lib/infrastructure/repositories/static-course-repository.js';
import { skillDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import { challengeRepository, localizedChallengeRepository } from '../../../../lib/infrastructure/repositories/index.js';

describe('Integration | Repository | static-course-repository', function() {
  context('#findReadSummaries', function() {
    context('content', function() {
      const page = { number: 1, size: 20 };
      it('should return complete StaticCourseSummary model', async function() {
        // given
        const staticCourseDB1 = databaseBuilder.factory.buildStaticCourse({
          id: 'staticCourse1_id',
          name : 'Mon super test statique 1',
          challengeIds : 'challengeABC, challengeDEF',
          isActive : true,
          createdAt : new Date('2010-01-04'),
        });
        const staticCourseDB2 = databaseBuilder.factory.buildStaticCourse({
          id: 'staticCourse2_id',
          name : 'Mon super test statique 2',
          challengeIds : 'challengeABC, challengeGHI, challengeJKL',
          isActive : false,
          createdAt : new Date('2013-01-04'),
        });
        await databaseBuilder.commit();

        // when
        const {
          results: actualStaticCourseSummaries,
        } = await findReadSummaries({ filter: {}, page });

        // then
        const expectedStaticCourseSummary1 = domainBuilder.buildStaticCourseSummary({
          id: staticCourseDB1.id,
          name: staticCourseDB1.name,
          challengeCount: 2,
          isActive: staticCourseDB1.isActive,
          createdAt: staticCourseDB1.createdAt,
        });
        const expectedStaticCourseSummary2 = domainBuilder.buildStaticCourseSummary({
          id: staticCourseDB2.id,
          name: staticCourseDB2.name,
          challengeCount: 3,
          isActive: staticCourseDB2.isActive,
          createdAt: staticCourseDB2.createdAt,
        });
        expect(actualStaticCourseSummaries[0]).to.deep.equal(expectedStaticCourseSummary2);
        expect(actualStaticCourseSummaries[1]).to.deep.equal(expectedStaticCourseSummary1);
      });
    });
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
      context('name', function() {
        const page = { number: 1, size: 20 };

        context('with results', function() {
          beforeEach(function() {
            // 4 Static courses
            [{ createdAt: new Date('2010-01-01'), name: 'iRis' },
              { createdAt:new Date('2011-01-01'), name: 'aras' },
              { createdAt: new Date('2012-01-01'), name: 'iras' },
              { createdAt: new Date('2013-01-01'), name: 'aris' }]
              .map(({ createdAt, name }, index) => {
                databaseBuilder.factory.buildStaticCourse({
                  id: `courseId${index}`,
                  name,
                  createdAt,
                });
              });
            return databaseBuilder.commit();
          });

          it('should return all the static courses of %name% when filter name is set', async function() {
            // given
            const filter = { name: 'ri' };

            // when
            const {
              results: actualStaticCourseSummaries,
              meta
            } = await findReadSummaries({ filter, page });

            // then
            const actualStaticCourseSummaryIds = actualStaticCourseSummaries.map(({ id }) => id);
            expect(actualStaticCourseSummaryIds).toEqual(['courseId3', 'courseId0']);
            expect(meta).to.deep.equal({
              page: 1,
              pageSize: 20,
              rowCount: 2,
              pageCount: 1,
            });
          });

          it('should return all the static courses of %name% when filter name is set in a case insensitive fashion', async function() {
            // given
            const filter = { name: 'rI' };

            // when
            const {
              results: actualStaticCourseSummaries,
              meta
            } = await findReadSummaries({ filter, page });

            // then
            const actualStaticCourseSummaryIds = actualStaticCourseSummaries.map(({ id }) => id);
            expect(actualStaticCourseSummaryIds).toEqual(['courseId3', 'courseId0']);
            expect(meta).to.deep.equal({
              page: 1,
              pageSize: 20,
              rowCount: 2,
              pageCount: 1,
            });
          });

          it('should return 0 static courses of %name% when filter name is set with a value that matches none of the records', async function() {
            // given
            const filter = { name: 'laura' };

            // when
            const {
              results: actualStaticCourseSummaries,
              meta
            } = await findReadSummaries({ filter, page });

            // then
            const actualStaticCourseSummaryIds = actualStaticCourseSummaries.map(({ id }) => id);
            expect(actualStaticCourseSummaryIds).to.be.empty;
            expect(meta).to.deep.equal({
              page: 1,
              pageSize: 20,
              rowCount: 0,
              pageCount: 0,
            });
          });
        });
      });
      context('with many filters', function() {
        const page = { number: 1, size: 20 };

        context('with results', function() {
          beforeEach(function() {
            // 4 Static courses
            [{ createdAt: new Date('2010-01-01'), name: 'iris' },
              { createdAt:new Date('2011-01-01'), name: 'aras' },
              { createdAt: new Date('2012-01-01'), name: 'iras' },
              { createdAt: new Date('2013-01-01'), name: 'aris' }]
              .map(({ createdAt, name }, index) => {
                databaseBuilder.factory.buildStaticCourse({
                  id: `courseId${index}`,
                  isActive: index % 2 === 0, // pair actif, impair inactif
                  name,
                  createdAt,
                });
              });
            return databaseBuilder.commit();
          });

          it('should return all the static courses according to given filters', async function() {
            // given
            const filter = { isActive: true, name: 'ri' };

            // when
            const {
              results: actualStaticCourseSummaries,
              meta
            } = await findReadSummaries({ filter, page });

            // then
            const actualStaticCourseSummaryIds = actualStaticCourseSummaries.map(({ id }) => id);
            expect(actualStaticCourseSummaryIds).toEqual(['courseId0']);
            expect(meta).to.deep.equal({
              page: 1,
              pageSize: 20,
              rowCount: 1,
              pageCount: 1,
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
      const challenges = [
        domainBuilder.buildChallenge({
          id: 'challengeA',
          status: 'A',
          skillId: 'skillA',
        }),
        domainBuilder.buildChallenge({
          id: 'challengeB',
          status: 'B',
          skillId: 'skillB',
        }),
      ];
      const localizedChallenges = [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeA',
          challengeId: 'challengeA',
          locale: 'fr',
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeB',
          challengeId: 'challengeB',
          locale: 'fr',
        }),
      ];
      const stubLocalizedChallengeRepository = vi.spyOn(localizedChallengeRepository, 'getMany').mockResolvedValue(localizedChallenges);
      const stubFilterChallengeRepository = vi.spyOn(challengeRepository, 'filter').mockResolvedValue(challenges);
      const stubFilterSkillDatasource = vi.spyOn(skillDatasource, 'filter').mockResolvedValue([
        { id: 'skillA', name: '@skillA' }, { id: 'skillB', name: '@skillB' }
      ]);
      await databaseBuilder.commit();

      //when
      const staticCourse = await getRead('rec123', { baseUrl: 'host.site' });

      //then
      expect(staticCourse.id).to.equal('rec123');
      expect(stubFilterChallengeRepository).toHaveBeenCalledWith({ filter: { ids: ['challengeA', 'challengeB'] } });
      expect(stubFilterSkillDatasource).toHaveBeenCalledWith({ filter: { ids: ['skillA', 'skillB'] } });
      expect(stubLocalizedChallengeRepository).toHaveBeenCalledWith({ ids: ['challengeA', 'challengeB'] });
    });
  });
});

