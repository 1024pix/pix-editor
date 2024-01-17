import { translationRepository, localizedChallengeRepository } from '../../infrastructure/repositories/index.js';
import { LocalizedChallenge, Translation } from '../models/index.js';
import { parseStream } from 'fast-csv';
import fp from 'lodash/fp.js';

export class InvalidFileError extends Error {}

export function importTranslations(csvStream, dependencies = { translationRepository, localizedChallengeRepository }) {
  return new Promise((resolve, reject) => {
    const translations = [];
    let locale;
    parseStream(csvStream, {
      headers: (headers) => {
        if (headers[0] !== 'key_name') throw new InvalidFileError('Expected first column to be key_name');
        locale = headers[1];
        try {
          new Intl.Locale(locale);
        } catch {
          throw new InvalidFileError('Expected second column to be a valid locale');
        }
        return ['key', 'value', ...Array(headers.length - 2)];
      },
      objectMode: true,
      strictColumnHandling: true,
    }).validate((data) => data.key && data.value)
      .on('error', reject)
      .on('data-invalid', (invalidData) => {
        reject(new InvalidFileError(`Invalid data: ${JSON.stringify(invalidData)}`));
      })
      .on('data', (row) => {
        translations.push(new Translation({
          ...replaceAntislashDoubleQuotes(row),
          locale,
        }));
      })
      .on('end', async () => {
        if (translations.length === 0) {
          return reject(new InvalidFileError());
        }

        const challengesLocales = extractChallengesLocales(translations);
        await dependencies.localizedChallengeRepository.create(challengesLocales);

        await dependencies.translationRepository.save({ translations });

        resolve();
      });
  });
}

function replaceAntislashDoubleQuotes(row) {
  return {
    ...row,
    value: row.value.replaceAll('[antislashdoublequote]', '\\"'),
  };
}

const extractChallengesLocales = fp.flow(
  fp.filter((translation) => {
    return translation.key.startsWith('challenge.');
  }),
  fp.map((challengeTranslation) => {
    return new LocalizedChallenge({
      challengeId: challengeTranslation.key.split('.')[1],
      locale: challengeTranslation.locale,
      status: 'proposé',
    });
  }),
  fp.uniqBy(({ challengeId, locale }) => `${challengeId}:${locale}`),
);
