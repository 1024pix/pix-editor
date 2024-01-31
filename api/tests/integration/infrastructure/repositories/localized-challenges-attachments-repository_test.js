import { describe, expect, it, afterEach } from 'vitest';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { localizedChallengesAttachmentsRepository } from '../../../../lib/infrastructure/repositories/index.js';

describe('Integration | Repository | localized-challenges-attachments-repository', function() {
  afterEach(async function() {
    await knex('localized_challenges-attachments').delete();
  });
  it('should save attachment and localized challenge ids', async function() {
    // given
    const localizedChallenge = databaseBuilder.factory.buildLocalizedChallenge({
      id: 'challengeNewid',
      challengeId: 'challengeId',
      locale: 'fr-fr',
      embedUrl: 'https://example.com/embed.html',
      status: 'proposé'
    });
    await databaseBuilder.commit();

    // when
    await localizedChallengesAttachmentsRepository.save({ localizedChallengeId: localizedChallenge.id, attachmentId: 'attachment-id' });

    // then
    const localizedChallengesAttachments = await knex('localized_challenges-attachments').select();

    expect(localizedChallengesAttachments).to.deep.equal([{
      localizedChallengeId: localizedChallenge.id,
      attachmentId: 'attachment-id',
    }]);
  });
});
