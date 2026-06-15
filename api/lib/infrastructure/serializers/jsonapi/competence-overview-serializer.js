import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

const serializer = new Serializer('competence-overview', {
  attributes: [
    'airtableId',
    'name',
    'thematicOverviews',
    'tubesCount',
    'skillsCount',
    'primaryLocales',
  ],
  transform(competenceOverview) {
    return {
      ...competenceOverview,
      primaryLocales: competenceOverview.primaryLocales.map((locale) => locale === 'fr-FR' ? locale.toLowerCase() : locale),
    };
  },
});

export function serialize(competenceOverview) {
  return serializer.serialize(competenceOverview);
}
