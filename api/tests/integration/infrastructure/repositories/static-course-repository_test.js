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
        const tagA_DB = databaseBuilder.factory.buildStaticCourseTag({ label: 'TagA' });
        const tagB_DB = databaseBuilder.factory.buildStaticCourseTag({ label: 'TagB' });
        const tagC_DB = databaseBuilder.factory.buildStaticCourseTag({ label: 'TagC' });
        const staticCourseDB1 = databaseBuilder.factory.buildStaticCourse({
          id: 'staticCourse1_id',
          name : 'Mon super test statique 1',
          challengeIds : 'challengeABC, challengeDEF',
          isActive : true,
          createdAt : new Date('2010-01-04'),
        });
        databaseBuilder.factory.linkTagsTo({ staticCourseTagIds: [tagB_DB.id, tagC_DB.id], staticCourseId: staticCourseDB1.id });
        const staticCourseDB2 = databaseBuilder.factory.buildStaticCourse({
          id: 'staticCourse2_id',
          name : 'Mon super test statique 2',
          challengeIds : 'challengeABC, challengeGHI, challengeJKL',
          isActive : false,
          createdAt : new Date('2013-01-04'),
        });
        databaseBuilder.factory.linkTagsTo({ staticCourseTagIds: [tagB_DB.id, tagA_DB.id], staticCourseId: staticCourseDB2.id });
        const staticCourseDB3 = databaseBuilder.factory.buildStaticCourse({
          id: 'staticCourse3_id',
          name : 'Mon super test statique 3',
          challengeIds : 'challengeABC',
          isActive : true,
          createdAt : new Date('2012-01-04'),
        });
        await databaseBuilder.commit();

        // when
        const {
          results: actualStaticCourseSummaries,
        } = await findReadSummaries({ filter: {}, page });

        // then
        const expectedTagA = domainBuilder.buildStaticCourseTag({ id: tagA_DB.id, label: tagA_DB.label });
        const expectedTagB = domainBuilder.buildStaticCourseTag({ id: tagB_DB.id, label: tagB_DB.label });
        const expectedTagC = domainBuilder.buildStaticCourseTag({ id: tagC_DB.id, label: tagC_DB.label });
        const expectedStaticCourseSummary1 = domainBuilder.buildStaticCourseSummary({
          id: staticCourseDB1.id,
          name: staticCourseDB1.name,
          challengeCount: 2,
          isActive: staticCourseDB1.isActive,
          createdAt: staticCourseDB1.createdAt,
          tags: [expectedTagB, expectedTagC],
        });
        const expectedStaticCourseSummary2 = domainBuilder.buildStaticCourseSummary({
          id: staticCourseDB2.id,
          name: staticCourseDB2.name,
          challengeCount: 3,
          isActive: staticCourseDB2.isActive,
          createdAt: staticCourseDB2.createdAt,
          tags: [expectedTagA, expectedTagB],
        });
        const expectedStaticCourseSummary3 = domainBuilder.buildStaticCourseSummary({
          id: staticCourseDB3.id,
          name: staticCourseDB3.name,
          challengeCount: 1,
          isActive: staticCourseDB3.isActive,
          createdAt: staticCourseDB3.createdAt,
          tags: [],
        });
        expect(actualStaticCourseSummaries[0]).to.deep.equal(expectedStaticCourseSummary2);
        expect(actualStaticCourseSummaries[1]).to.deep.equal(expectedStaticCourseSummary3);
        expect(actualStaticCourseSummaries[2]).to.deep.equal(expectedStaticCourseSummary1);
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
      const staticCourseDb = databaseBuilder.factory.buildStaticCourse({
        id: 'rec123',
        challengeIds: 'challengeA,challengeB',
        name: 'Mon super test statique',
        description: 'Ma super description de test statique',
        isActive: false,
        deactivationReason: 'Je l\'aime plus.',
        createdAt: new Date('2010-01-04'),
        updatedAt: new Date('2010-01-11'),
      });
      const staticCourseTagDb1 = databaseBuilder.factory.buildStaticCourseTag({
        id: 123,
        label: 'Pix+BTP',
      });
      const staticCourseTagDb2 = databaseBuilder.factory.buildStaticCourseTag({
        id: 456,
        label: 'Arbre',
      });
      databaseBuilder.factory.linkTagsTo({
        staticCourseId: staticCourseDb.id,
        staticCourseTagIds: [staticCourseTagDb1.id, staticCourseTagDb2.id],
      });
      const challenges = [
        domainBuilder.buildChallenge({
          id: 'challengeA',
          status: 'A',
          skillId: 'skillA',
          instruction: 'Mon instruction A',
        }),
        domainBuilder.buildChallenge({
          id: 'challengeB',
          status: 'B',
          skillId: 'skillB',
          instruction: 'Mon instruction B',
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
      const challengeSummaryA = domainBuilder.buildChallengeSummary(
        {
          id: challenges[0].id,
          instruction: challenges[0].instruction,
          skillName: '@skillA',
          status: challenges[0].status,
          index: 0,
          previewUrl: 'host.site/api/challenges/challengeA/preview',
        }
      );
      const challengeSummaryB = domainBuilder.buildChallengeSummary({
        id: challenges[1].id,
        instruction: challenges[1].instruction,
        skillName: '@skillB',
        status: challenges[1].status,
        index: 1,
        previewUrl: 'host.site/api/challenges/challengeB/preview',
      });
      const tagA = domainBuilder.buildStaticCourseTag({
        id: staticCourseTagDb2.id,
        label: staticCourseTagDb2.label,
      });
      const tagB = domainBuilder.buildStaticCourseTag({
        id: staticCourseTagDb1.id,
        label: staticCourseTagDb1.label,
      });
      expect(staticCourse).to.deep.equal(domainBuilder.buildStaticCourseRead({
        id: staticCourseDb.id,
        name: staticCourseDb.name,
        description: staticCourseDb.description,
        challengeSummaries: [challengeSummaryA, challengeSummaryB],
        isActive: staticCourseDb.isActive,
        deactivationReason: staticCourseDb.deactivationReason,
        createdAt: staticCourseDb.createdAt,
        updatedAt: staticCourseDb.updatedAt,
        tags: [tagA, tagB],
      }));
      expect(stubFilterChallengeRepository).toHaveBeenCalledWith({ filter: { ids: ['challengeA', 'challengeB'] } });
      expect(stubFilterSkillDatasource).toHaveBeenCalledWith({ filter: { ids: ['skillA', 'skillB'] } });
      expect(stubLocalizedChallengeRepository).toHaveBeenCalledWith({ ids: ['challengeA', 'challengeB'] });
    });
  });
});

