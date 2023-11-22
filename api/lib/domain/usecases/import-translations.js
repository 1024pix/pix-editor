import { translationRepository, localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import {LocalizedChallenge, Translation} from '../models/index.js';
import { parseStream } from 'fast-csv';
import fp from 'lodash/fp';
export class InvalidFileError extends Error {}

export function importTranslations(csvStream, dependencies = { translationRepository, localizedChallengeRepository }) {
  return new Promise((resolve, reject) => {
    const translations = [];
    parseStream(csvStream, {
      headers: true,
      strictColumnHandling: true,
    }).validate((data) => data.key && data.locale && data.value)
      .on('error', reject)
      .on('data-invalid', reject)
      .on('data', (row) => {
        translations.push(new Translation(row));
      })
      .on('end', async () => {
        if (translations.length === 0) {
          return reject(new InvalidFileError());
        }

        const challengesLocales = extractChallengesLocales(translations);

        await dependencies.localizedChallengeRepository.create(challengesLocales);

        await dependencies.translationRepository.save(translations);

        resolve();
      });
  });
}

const extractChallengesLocales = fp.flow(
  fp.filter((translation) => {
    return translation.key.startsWith('challenge.');
  }),
  fp.map((challengeTranslation) => {
    return new LocalizedChallenge({
      challengeId: challengeTranslation.key.split('.')[1],
      locale: challengeTranslation.locale,
    })
  }),
  fp.uniqBy(['locale', 'challengeId']),
);
