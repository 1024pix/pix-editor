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
      const allFrameworks = await knex('frameworks').select('*').first();
      expect(allFrameworks.id).toStrictEqual(otherFramework.id);

      const areaAfterDeletion = await knex('areas').select('*').where('id', area.id).first();
      expect(areaAfterDeletion).toBeFalsy();
      const allAreas = await knex('areas').select('*').first();
      expect(allAreas.id).toStrictEqual(otherArea.id);

      const competenceAfterDeletion = await knex('competences').select('*').where('id', competence.id).first();
      expect(competenceAfterDeletion).toBeFalsy();
      const allCompetences = await knex('competences').select('*').first();
      expect(allCompetences.id).toStrictEqual(otherCompetence.id);

      const thematicAfterDeletion = await knex('thematics').select('*').where('id', thematic.id).first();
      expect(thematicAfterDeletion).toBeFalsy();
      const allThematics = await knex('thematics').select('*').first();
      expect(allThematics.id).toStrictEqual(otherThematic.id);

      const tubeAfterDeletion = await knex('tubes').select('*').where('id', tube.id).first();
      expect(tubeAfterDeletion).toBeFalsy();
      const allTubes = await knex('tubes').select('*').first();
      expect(allTubes.id).toStrictEqual(otherTube.id);

      const skillAfterDeletion = await knex('skills').select('*').where('id', skill.id).first();
      expect(skillAfterDeletion).toBeFalsy();
      const allSkills = await knex('skills').select('*').first();
      expect(allSkills.id).toStrictEqual(otherSkill.id);

      const challengeAfterDeletion = await knex('challenges').select('*').where('id', challenge.id).first();
      expect(challengeAfterDeletion).toBeFalsy();
      const allChallenges = await knex('challenges').select('*').first();
      expect(allChallenges.id).toStrictEqual(otherChallenge.id);

      const localizedChallengeAfterDeletion = await knex('localized_challenges').select('*').where('id', localizedChallenge.id).first();
      expect(localizedChallengeAfterDeletion).toBeFalsy();
      const allLocalizedChallenges = await knex('localized_challenges').select('*').first();
      expect(allLocalizedChallenges.id).toStrictEqual(otherLocalizedChallenge.id);

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
        expect(logger.error).toHaveBeenCalledExactlyOnceWith(`Framework with id '${options.frameworkId}' does not exist.`);
      });
    });
  });
});
