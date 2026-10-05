import { beforeEach, describe, expect, it, vi } from 'vitest';

import { databaseBuilder, knex } from '../test-helper.js';
import { DeleteFrameworkByIdScript } from '../../scripts/delete-framework-by-id.js';

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
      const otherFramework = databaseBuilder.factory.buildFramework({ id: 'recPatateDouce', name: 'Patate Douce' });
      const areaFromOtherFramework = databaseBuilder.factory.buildArea({ id: 'areaPatateDouce', frameworkId: otherFramework.id, code: '1', color: 'red' });
      const areaTranslationNotToDelete = databaseBuilder.factory.buildTranslation({ key: `area.${areaFromOtherFramework.id}.title`, locale: 'fr-FR', value: 'mon super titre de domaine' });
      await databaseBuilder.commit();

      const options = {
        dryRun: false,
        frameworkId: framework.id,
      };

      // when
      const result = await script.handle({ options, logger });

      // then
      expect(result).toEqual(framework.id);

      const frameworkAfterDeletion = await knex('frameworks').select('*').where('id', framework.id).first();
      expect(frameworkAfterDeletion).toBeFalsy();

      const areaAfterDeletion = await knex('areas').select('*').where('id', area.id).first();
      expect(areaAfterDeletion).toBeFalsy();

      const competenceAfterDeletion = await knex('competences').select('*').where('id', competence.id).first();
      expect(competenceAfterDeletion).toBeFalsy();

      const thematicAfterDeletion = await knex('thematics').select('*').where('id', thematic.id).first();
      expect(thematicAfterDeletion).toBeFalsy();

      const tubeAfterDeletion = await knex('tubes').select('*').where('id', tube.id).first();
      expect(tubeAfterDeletion).toBeFalsy();

      const skillAfterDeletion = await knex('skills').select('*').where('id', skill.id).first();
      expect(skillAfterDeletion).toBeFalsy();

      const challengeAfterDeletion = await knex('challenges').select('*').where('id', challenge.id).first();
      expect(challengeAfterDeletion).toBeFalsy();

      const localizedChallengeAfterDeletion = await knex('localized_challenges').select('*').where('id', localizedChallenge.id).first();
      expect(localizedChallengeAfterDeletion).toBeFalsy();

      const translationsAfterDeletions = await knex('translations').select('*');
      expect(translationsAfterDeletions).toStrictEqual([areaTranslationNotToDelete]);

      const undeletedFramework = await knex('frameworks').select('*').where('id', otherFramework.id).first();
      expect(undeletedFramework).toBeTruthy();

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
