const Airtable = require('airtable');

module.exports = async function(databaseBuilder) {
  if (process.env.AIRTABLE_SAVE_TRANSLATIONS !== 'true') return;

  const {
    AIRTABLE_API_KEY: airtableApiKey,
    AIRTABLE_BASE: airtableBase,
  } = process.env;

  const airtableClient = new Airtable({ apiKey: airtableApiKey }).base(airtableBase);

  const airtableTranslations = await airtableClient.table('translations').select().all();

  const translations = airtableTranslations.map((translation) => {
    return {
      key: translation.get('key'),
      locale: translation.get('locale'),
      value: translation.get('value'),
    };
  });

  translations.forEach(databaseBuilder.factory.buildTranslation);
};
