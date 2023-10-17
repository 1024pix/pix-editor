import { fileURLToPath } from 'node:url';
import Airtable from 'airtable';
import _ from 'lodash';
import * as challengeTranslations from '../../lib/infrastructure/translations/challenge.js';
import { translationRepository } from '../../lib/infrastructure/repositories/index.js';
import { disconnect } from '../../db/knex-database-connection.js';
import { LOCALE_TO_LANGUAGE_MAP } from '../../lib/domain/constants.js';

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

export async function migrateChallengesTranslationFromAirtable({ airtableClient }) {
  const allChallenges = await airtableClient
    .table('Epreuves')
    .select({
      fields: [
        'id persistant',
        'Consigne',
        'Consigne alternative',
        'Propositions',
        'Bonnes réponses',
        'Bonnes réponses à afficher',
        'Langues',
      ],
    })
    .all();

  const translations = allChallenges.flatMap((challenge) => {
    return challengeTranslations.extractFromChallenge({
      id: challenge.get('id persistant'),
      instruction: challenge.get('Consigne'),
      alternativeInstruction: challenge.get('Consigne alternative'),
      proposals: challenge.get('Propositions'),
      solution: challenge.get('Bonnes réponses'),
      solutionToDisplay: challenge.get('Bonnes réponses à afficher'),
      locales: _convertLanguagesToLocales(challenge.get('Langues')),
    });
  });

  for (const translationsChunk of _.chunk(translations, 5000)) {
    await translationRepository.save(translationsChunk);
  }
}

function _convertLanguagesToLocales(languages) {
  return languages.map((language) => _convertLanguageToLocale(language));
}

function _convertLanguageToLocale(language) {
  const locale = _.findKey(LOCALE_TO_LANGUAGE_MAP, (lang) => language === lang);
  if (!locale) {
    throw new Error('Langue inconnue');
  }

  return locale;
}

async function main() {
  if (!isLaunchedFromCommandLine) return;

  try {
    const airtableClient = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE);

    await migrateChallengesTranslationFromAirtable({ airtableClient });
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
