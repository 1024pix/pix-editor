import { beforeEach, describe, expect, it, vi } from 'vitest';

import { databaseBuilder, knex } from '../test-helper.js';
import { DeleteFrameworkByIdScript } from '../../scripts/delete-framework-by-id.js';
import { translationRepository } from '../../lib/infrastructure/repositories/index.js';

describe('Script | DeleteFrameworkByIdScript', () => {
  let script;
  let logger;

  beforeEach(() => {
    script = new DeleteFrameworkByIdScript();
    logger = {
      info: vi.fn(),
      error: vi.fn(),
    };
  });

  describe('#handle', () => {
    it('should delete the given framework', async () => {
      // given
      const { framework, area, competence, thematic, tube, skill, challenge, localizedChallenge } = databaseBuilder.factory.buildChallengeInGroup({});
      const { framework: otherFramework, area: otherArea, competence: otherCompetence, thematic: otherThematic, tube: otherTube, skill: otherSkill, challenge: otherChallenge, localizedChallenge: otherLocalizedChallenge } = databaseBuilder.factory.buildChallengeInGroup({});
      const staticCourseToDelete = databaseBuilder.factory.buildStaticCourse({ challengeIds: `${challenge.id},randomChallengeId` });
      const staticCourseToKeep = databaseBuilder.factory.buildStaticCourse({ challengeIds: `${otherLocalizedChallenge.id},randomChallengeId` });

      await databaseBuilder.commit();

      const options = {
        dryRun: false,
        frameworkId: framework.id,
      };

      // when
      await script.handle({ options, logger });

      // then
      const frameworkAfterDeletion = await knex('frameworks').select('*').where('id', framework.id).first();
      expect(frameworkAfterDeletion).toBeFalsy();
      const allFrameworkIds = await knex('frameworks').select('id').pluck('id');
      expect(allFrameworkIds).toStrictEqual([otherFramework.id]);

      const areaAfterDeletion = await knex('areas').select('*').where('id', area.id).first();
      expect(areaAfterDeletion).toBeFalsy();
      const allAreaIds = await knex('areas').select('id').pluck('id');
      expect(allAreaIds).toStrictEqual([otherArea.id]);

      const competenceAfterDeletion = await knex('competences').select('*').where('id', competence.id).first();
      expect(competenceAfterDeletion).toBeFalsy();
      const allCompetenceIds = await knex('competences').select('id').pluck('id');
      expect(allCompetenceIds).toStrictEqual([otherCompetence.id]);

      const thematicAfterDeletion = await knex('thematics').select('*').where('id', thematic.id).first();
      expect(thematicAfterDeletion).toBeFalsy();
      const allThematicIds = await knex('thematics').select('id').pluck('id');
      expect(allThematicIds).toStrictEqual([otherThematic.id]);

      const tubeAfterDeletion = await knex('tubes').select('*').where('id', tube.id).first();
      expect(tubeAfterDeletion).toBeFalsy();
      const allTubeIds = await knex('tubes').select('id').pluck('id');
      expect(allTubeIds).toStrictEqual([otherTube.id]);

      const skillAfterDeletion = await knex('skills').select('*').where('id', skill.id).first();
      expect(skillAfterDeletion).toBeFalsy();
      const allSkillIds = await knex('skills').select('id').pluck('id');
      expect(allSkillIds).toStrictEqual([otherSkill.id]);

      const challengeAfterDeletion = await knex('challenges').select('*').where('id', challenge.id).first();
      expect(challengeAfterDeletion).toBeFalsy();
      const allChallengeIds = await knex('challenges').select('id').pluck('id');
      expect(allChallengeIds).toStrictEqual([otherChallenge.id]);

      const localizedChallengeAfterDeletion = await knex('localized_challenges').select('*').where('id', localizedChallenge.id).first();
      expect(localizedChallengeAfterDeletion).toBeFalsy();
      const allLocalizedChallengeIds = await knex('localized_challenges').select('id').pluck('id');
      expect(allLocalizedChallengeIds).toStrictEqual([otherLocalizedChallenge.id]);

      const staticCourseAfterDeletion = await knex('static_courses').select('*').where('id', staticCourseToDelete.id).first();
      expect(staticCourseAfterDeletion).toBeFalsy();
      const allStaticCourseIds = await knex('static_courses').select('id').pluck('id');
      expect(allStaticCourseIds).toStrictEqual([staticCourseToKeep.id]);

      const translationEntityIdsAfterDeletions = new Set((await translationRepository.list()).map((translation) => translation.entityId))
        .values()
        .toArray()
        .toSorted();

      const entityIdsToKeep = [
        otherArea.id,
        otherCompetence.id,
        otherThematic.id,
        otherTube.id,
        otherSkill.id,
        otherChallenge.id,
      ].toSorted();
      expect(translationEntityIdsAfterDeletions).toStrictEqual(entityIdsToKeep);

      expect(logger.error).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenNthCalledWith(1, options, 'Script options');
      expect(logger.info).toHaveBeenNthCalledWith(
        2,
        {
          frameworkId: framework.id,
          areaIds: [area.id],
          competenceIds: [competence.id],
          thematicIds: [thematic.id],
          tubeIds: [tube.id],
          skillIds: [skill.id],
          challengeIds: [challenge.id],
          localizedChallengeIds: [localizedChallenge.id],
          staticCourseIds: [staticCourseToDelete.id],
          deletedEntitiesCount: 8,
        },
        `About to delete framework '${framework.name}'`,
      );
      expect(logger.info).toHaveBeenNthCalledWith(3, {
        frameworkId: framework.id,
        deletedTranslationsCount: 14,
      }, `Deleted translations from framework '${framework.name}'`);
      expect(logger.info).toHaveBeenNthCalledWith(
        4,
        { deletedStaticCoursesCount: 1, frameworkId: framework.id },
        `Deleted static courses using challenges from framework '${framework.name}'`,
      );
      expect(logger.info).toHaveBeenNthCalledWith(
        5,
        { frameworkId: framework.id },
        `Successfully deleted framework '${framework.name}'`,
      );
      expect(logger.info).toHaveBeenCalledTimes(5);
    });

    describe('when given framework does not exist', () => {
      it('should log an error', async () => {
        // given
        const options = {
          dryRun: false,
          frameworkId: 'rec123678MonFrameWorkGarantySansZia',
        };

        // when
        await script.handle({ options, logger });

        // then
        expect(logger.error).toHaveBeenCalledExactlyOnceWith({ frameworkId: options.frameworkId }, `Framework with id '${options.frameworkId}' does not exist.`);
      });
    });

    describe('when dry run is enabled', () => {
      it('should not delete anything', async () => {
        // given
        const { framework, area, competence, thematic, tube, skill, challenge, localizedChallenge } = databaseBuilder.factory.buildChallengeInGroup({});
        const { framework: otherFramework, area: otherArea, competence: otherCompetence, thematic: otherThematic, tube: otherTube, skill: otherSkill, challenge: otherChallenge, localizedChallenge: otherLocalizedChallenge } = databaseBuilder.factory.buildChallengeInGroup({});
        const staticCourse = databaseBuilder.factory.buildStaticCourse({ challengeIds: `${challenge.id},randomChallengeId` });

        await databaseBuilder.commit();

        const options = {
          dryRun: true,
          frameworkId: framework.id,
        };

        // when
        await script.handle({ options, logger });

        // then
        const frameworksAfterDeletion = await knex('frameworks').select('id').pluck('id').orderBy('id');
        expect(frameworksAfterDeletion).toStrictEqual([framework.id, otherFramework.id]);

        const areasAfterDeletion = await knex('areas').select('id').pluck('id').orderBy('id');
        expect(areasAfterDeletion).toStrictEqual([area.id, otherArea.id]);

        const competencesAfterDeletion = await knex('competences').select('id').pluck('id').orderBy('id');
        expect(competencesAfterDeletion).toStrictEqual([competence.id, otherCompetence.id]);

        const thematicsAfterDeletion = await knex('thematics').select('id').pluck('id').orderBy('id');
        expect(thematicsAfterDeletion).toStrictEqual([thematic.id, otherThematic.id]);

        const tubesAfterDeletion = await knex('tubes').select('id').pluck('id').orderBy('id');
        expect(tubesAfterDeletion).toStrictEqual([tube.id, otherTube.id]);

        const skillsAfterDeletion = await knex('skills').select('id').pluck('id').orderBy('id');
        expect(skillsAfterDeletion).toStrictEqual([skill.id, otherSkill.id]);

        const challengesAfterDeletion = await knex('challenges').select('id').pluck('id').orderBy('id');
        expect(challengesAfterDeletion).toStrictEqual([challenge.id, otherChallenge.id]);

        const localizedChallengesAfterDeletion = await knex('localized_challenges').select('id').pluck('id').orderBy('id');
        expect(localizedChallengesAfterDeletion).toStrictEqual([localizedChallenge.id, otherLocalizedChallenge.id]);

        const staticCoursesAfterDeletion = await knex('static_courses').select('id').pluck('id').orderBy('id');
        expect(staticCoursesAfterDeletion).toStrictEqual([staticCourse.id]);

        const translationEntityIdsAfterDeletions = new Set((await translationRepository.list()).map((translation) => translation.entityId))
          .values()
          .toArray()
          .toSorted();

        const entityIdsToKeep = [
          area.id,
          otherArea.id,
          competence.id,
          otherCompetence.id,
          thematic.id,
          otherThematic.id,
          tube.id,
          otherTube.id,
          skill.id,
          otherSkill.id,
          challenge.id,
          otherChallenge.id,
        ].toSorted();
        expect(translationEntityIdsAfterDeletions).toStrictEqual(entityIdsToKeep);

        expect(logger.error).not.toHaveBeenCalled();
        expect(logger.info).toHaveBeenNthCalledWith(1, options, 'Script options');
        expect(logger.info).toHaveBeenNthCalledWith(
          2,
          {
            frameworkId: framework.id,
            areaIds: [area.id],
            competenceIds: [competence.id],
            thematicIds: [thematic.id],
            tubeIds: [tube.id],
            skillIds: [skill.id],
            challengeIds: [challenge.id],
            localizedChallengeIds: [localizedChallenge.id],
            staticCourseIds: [staticCourse.id],
            deletedEntitiesCount: 8,
          },
          `About to delete framework '${framework.name}'`,
        );
        expect(logger.info).toHaveBeenNthCalledWith(3, {
          frameworkId: framework.id,
          deletedTranslationsCount: 14,
        }, `Deleted translations from framework '${framework.name}'`);
        expect(logger.info).toHaveBeenNthCalledWith(4, {
          frameworkId: framework.id,
          deletedStaticCoursesCount: 1,
        }, `Deleted static courses using challenges from framework '${framework.name}'`);
        expect(logger.info).toHaveBeenNthCalledWith(
          5,
          { frameworkId: framework.id },
          `Dry run is enabled, stopping before deleting framework '${framework.name}'`,
        );
        expect(logger.info).toHaveBeenCalledTimes(5);
      });
    });
  });
});
