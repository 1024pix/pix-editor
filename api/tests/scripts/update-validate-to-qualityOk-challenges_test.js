import { beforeEach, describe, expect, it } from 'vitest';

import { databaseBuilder, domainBuilder, knex } from '../test-helper.js';
import { UpdateValidateToQualityOkChallenges } from '../../scripts/update-validate-to-qualityOk-challenges.js';
import { logger } from '../../lib/infrastructure/logger.js';

describe('Script | UpdateValidateToQualityOkChallenges', () => {
  /** @type {UpdateValidateToQualityOkChallenges} */
  let script;

  beforeEach(() => {
    script = new UpdateValidateToQualityOkChallenges();
  });

  describe('#handle', () => {
    beforeEach(async () => {
      const today = new Date();
      const dayMinus15 = new Date();
      dayMinus15.setDate(-15);

      const challengeDataToUpdate = {
        id: 'challengeId',
        skillId: 'skillId1',
        status: 'validé',
        validatedAt: dayMinus15,
        isQualityOk: false,
      };
      const localizedChallenge = {
        id: challengeDataToUpdate.id,
        challengeId: challengeDataToUpdate.id,
        locale: 'fr',
      };
      databaseBuilder.factory.buildChallengeInGroup({ challenge: challengeDataToUpdate, localizedChallenge });
      const challengeDataFromPix1D = {
        id: 'challengeId_fromPix1D',
        skillId: 'skillId2',
        status: 'validé',
        validatedAt: dayMinus15,
        isQualityOk: false,
      };
      const localizedChallengeFromPix1D = {
        id: challengeDataFromPix1D.id,
        challengeId: challengeDataFromPix1D.id,
        locale: 'fr',
      };
      databaseBuilder.factory.buildChallengeInGroup({ challenge: challengeDataFromPix1D, localizedChallenge: localizedChallengeFromPix1D, framework: { name: 'Pix 1D' } });

      const challengeNotToUpdate = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeId_notupdate1',
        skillId: 'skillId1',
        status: 'validé',
        validatedAt: today,
        isQualityOk: false,
      });
      databaseBuilder.factory.buildChallenge(challengeNotToUpdate);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeNotToUpdate.id,
        challengeId: challengeNotToUpdate.id,
        locale: 'fr',
      });

      const challengeNotToUpdate2 = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeId_notupdate2',
        skillId: 'skillId1',
        status: 'archivé',
        validatedAt: dayMinus15,
        isQualityOk: false,
      });
      databaseBuilder.factory.buildChallenge(challengeNotToUpdate2);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeNotToUpdate2.id,
        challengeId: challengeNotToUpdate2.id,
        locale: 'fr',
      });

      const challengeToUpdate2 = domainBuilder.buildChallengeDatasourceObject({
        id: 'challengeId_update2',
        skillId: 'skillId1',
        status: 'validé',
        validatedAt: null,
        isQualityOk: false,
      });
      databaseBuilder.factory.buildChallenge(challengeToUpdate2);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeToUpdate2.id,
        challengeId: challengeToUpdate2.id,
        locale: 'fr',
      });

      await databaseBuilder.commit();
    });

    it('update only challenges with status validate and validateAt older than 15days or null ', async () => {
      // given
      const options = { dryRun: false };

      // when
      await script.handle({ options, logger });

      // then

      const challengesNotToUpdate1 = await knex.select('isQualityOk').from('challenges').where({ id: 'challengeId_notupdate1' }).first();
      const challengesNotToUpdate2 = await knex.select('isQualityOk').from('challenges').where({ id: 'challengeId_notupdate2' }).first();
      const challengesToUpdate = await knex.select('isQualityOk').from('challenges').where({ id: 'challengeId' }).first();
      const challengesToUpdate2 = await knex.select('isQualityOk').from('challenges').where({ id: 'challengeId_update2' }).first();
      const challengesFromPix1D = await knex.select('isQualityOk').from('challenges').where({ id: 'challengeId_fromPix1D' }).first();
      expect(challengesToUpdate.isQualityOk).to.be.true;
      expect(challengesToUpdate2.isQualityOk).to.be.true;
      expect(challengesNotToUpdate1.isQualityOk).to.be.false;
      expect(challengesNotToUpdate2.isQualityOk).to.be.false;
      expect(challengesFromPix1D.isQualityOk).to.be.false;
    });

    describe('when dryRun option is true', () => {
      it('stops before deletion', async () => {
        // given
        const options = { dryRun: true };

        // when
        await script.handle({ options, logger });

        // then
        const challengesNotToUpdate1 = await knex.select('isQualityOk').from('challenges').where({ id: 'challengeId_notupdate1' }).first();
        const challengesNotToUpdate2 = await knex.select('isQualityOk').from('challenges').where({ id: 'challengeId_notupdate2' }).first();
        const challengesToUpdate = await knex.select('isQualityOk').from('challenges').where({ id: 'challengeId' }).first();
        const challengesToUpdate2 = await knex.select('isQualityOk').from('challenges').where({ id: 'challengeId_update2' }).first();
        const challengesFromPix1D = await knex.select('isQualityOk').from('challenges').where({ id: 'challengeId_fromPix1D' }).first();
        expect(challengesToUpdate.isQualityOk).to.be.false;
        expect(challengesToUpdate2.isQualityOk).to.be.false;
        expect(challengesNotToUpdate1.isQualityOk).to.be.false;
        expect(challengesNotToUpdate2.isQualityOk).to.be.false;
        expect(challengesFromPix1D.isQualityOk).to.be.false;
      });
    });
  });
});
