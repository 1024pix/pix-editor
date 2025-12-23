import fp from 'lodash/fp.js';

import { knex } from '../../../db/knex-database-connection.js';
import { localizedChallengeRepository, translationRepository } from '../../infrastructure/repositories/index.js';
import { LocalizedChallenge } from '../models/index.js';

export async function importTranslations(translations, dependencies = { translationRepository, localizedChallengeRepository }) {
  return knex.transaction(async (transaction) => {
    if (translations.length === 0) return;

    await dependencies.translationRepository.save({ translations, transaction });

    const localizedChallenges = extractLocalizedChallengesFromTranslations(translations);
    if (localizedChallenges.length === 0) return;

    await dependencies.localizedChallengeRepository.create({ localizedChallenges, transaction });
  });
}

const extractLocalizedChallengesFromTranslations = fp.flow(
  fp.filter((translation) => {
    return translation.key.startsWith('challenge.');
  }),
  fp.uniqBy(({ key, locale }) => `${key.slice(0, key.lastIndexOf('.'))}:${locale}`),
  fp.map(LocalizedChallenge.buildAlternativeFromTranslation),
);
