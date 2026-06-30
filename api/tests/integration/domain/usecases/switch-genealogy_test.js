import { beforeEach, describe, expect, it } from 'vitest';
import { switchGenealogy } from '../../../../lib/domain/usecases/index.js';
import { databaseBuilder } from '../../../test-helper.js';
import { Challenge } from '../../../../lib/domain/models/index.js';

describe('Integration | Usecases | Switch Genealogy', function() {
  let challengePrototype, alternativeChallenge;
  beforeEach(async () => {
    const { challenge } = databaseBuilder.factory.buildChallengeInGroup({ challenge: { genealogy: Challenge.GENEALOGIES.PROTOTYPE, version: 10, alternativeVersion: null }, localizedChallenge: { locale: 'fr-FR' } });

    alternativeChallenge = databaseBuilder.factory.buildChallenge({ id: 'challengeIdDécli', skillId: challenge.skillId, genealogy: Challenge.GENEALOGIES.DECLINAISON, alternativeVersion: 56 });
    databaseBuilder.factory.buildLocalizedChallenge({ id: 'localizeChallengeId', challengeId: alternativeChallenge.id, locale: 'fr-FR' });

    challengePrototype = challenge;

    await databaseBuilder.commit();
  });
  it('should switch challenge genealogy given alternative challenge id', async () => {
    // when

    await switchGenealogy({ alternativeChallengeId: alternativeChallenge.id });

    const updatedPrototypeChallengeToBeAlternative = await knex('challenges').select('version', 'genealogy', 'alternativeVersion').where('id', challengePrototype.id).first();
    const updatedAlternativeChallengeToBePrototype = await knex('challenges').select('version', 'genealogy', 'alternativeVersion').where('id', alternativeChallenge.id).first();

    expect(updatedPrototypeChallengeToBeAlternative).toStrictEqual({
      version: challengePrototype.version,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
      alternativeVersion: 56,
    });

    expect(updatedAlternativeChallengeToBePrototype).toStrictEqual({
      version: challengePrototype.version,
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      alternativeVersion: null,
    });
  });
});
