import { challengeRepository } from '../../infrastructure/repositories/index.js';
import { normalizeNonBreakingSpace } from '../../infrastructure/utils/normalize-non-breaking-space.js';
import { attachmentDatasource } from '../../infrastructure/datasources/airtable/index.js';
import { createChallengeTransformer } from '../../infrastructure/transformers/index.js';
import * as updatedRecordNotifier from '../../infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../infrastructure/pix-api-client.js';
import { logger } from '../../infrastructure/logger.js';

export async function updateChallenge(challenge, dependencies = { challengeRepository, attachmentDatasource }) {
  if (challenge.locales.includes('fr') || challenge.locales.includes('fr-fr')) {
    const fieldsToNormalize = ['instruction', 'proposals', 'alternativeInstruction'];
    for (const field of fieldsToNormalize) {
      if (challenge[field]) {
        challenge[field] = normalizeNonBreakingSpace(challenge[field]);
      }
    }
  }
  const updatedChallenge = await dependencies.challengeRepository.update(challenge);

  try {
    const attachments = await dependencies.attachmentDatasource.filterByLocalizedChallengeId(updatedChallenge.id);
    const transformChallenge = createChallengeTransformer({ attachments });
    const newChallenge = transformChallenge(updatedChallenge);
    await updatedRecordNotifier.notify({
      updatedRecord: newChallenge,
      model: 'challenges',
      pixApiClient
    });
  } catch (err) {
    logger.error(err);
  }
  return updatedChallenge;
}
