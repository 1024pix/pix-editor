import Airtable from 'airtable';

import { fetchLocalizedChallenges } from '../../../scripts/fill-localized-challenges/index.js';

export async function localizedChallengesBuilder(databaseBuilder) {
  const {
    AIRTABLE_API_KEY: airtableApiKey,
    AIRTABLE_BASE: airtableBase,
  } = process.env;

  const airtableClient = new Airtable({ apiKey: airtableApiKey }).base(airtableBase);

  const localizedChallenges = await fetchLocalizedChallenges({ airtableClient });

  localizedChallenges.forEach(databaseBuilder.factory.buildLocalizedChallenge);
}
