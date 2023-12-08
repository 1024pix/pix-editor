import Airtable from 'airtable';

export async function translationsBuilder(databaseBuilder) {
  const {
    AIRTABLE_API_KEY: airtableApiKey,
    AIRTABLE_BASE: airtableBase,
  } = process.env;

  const airtableClient = new Airtable({ apiKey: airtableApiKey }).base(airtableBase);

  let airtableTranslations;
  try {
    airtableTranslations = await airtableClient.table('translations').select().all();
  } catch (err) {
    if (err.statusCode === 404) {
      console.log('Skipping translations seeding: did not find translations table in Airtable');
      return;
    }
    throw err;
  }

  const translations = airtableTranslations.map((translation) => {
    return {
      key: translation.get('key'),
      locale: translation.get('locale'),
      value: translation.get('value'),
    };
  });

  translations.forEach(databaseBuilder.factory.buildTranslation);
}
