import Airtable from 'airtable';
import fp from 'lodash/fp.js';
import { convertLanguagesToLocales } from '../../../lib/domain/services/convert-locales.js';
import { generateNewId } from '../../../lib/infrastructure/utils/id-generator.js';

export async function localizedChallengesBuilder(databaseBuilder, translations) {
  const {
    AIRTABLE_API_KEY: airtableApiKey,
    AIRTABLE_BASE: airtableBase,
  } = process.env;

  const airtableClient = new Airtable({ apiKey: airtableApiKey }).base(airtableBase);

  const challenges = await airtableClient
    .table('Epreuves')
    .select({
      fields: [
        'id persistant',
        'Langues',
        'Embed URL',
      ],
    })
    .all();

  const challengesLocales = fp.flow(
    fp.filter(({ key }) => key.startsWith('challenge.')),
    fp.groupBy(({ key }) => key.split('.')[1]),
    fp.mapValues(fp.flow(fp.map('locale'), fp.uniq))
  )(translations);

  const localizedChallenges = challenges.flatMap((challenge) => {
    const challengeId = challenge.get('id persistant');
    const primaryLocale = convertLanguagesToLocales(challenge.get('Langues'))?.sort()?.[0] ?? 'fr';
    return [
      { id: challengeId, challengeId, locale: primaryLocale, embedUrl: challenge.get('Embed URL') },
      ...challengesLocales[challengeId]
        ?.filter((locale) => locale !== primaryLocale)
        .map((locale) => ({
          id: generateNewId('challenge'), challengeId, locale,
        })) ?? [],
    ];
  });

  localizedChallenges.forEach(databaseBuilder.factory.buildLocalizedChallenge);
}
