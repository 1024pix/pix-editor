import Jsonapi from 'jsonapi-serializer';

const { Serializer } = Jsonapi;

const serializer = new Serializer('tube', {
  attributes: [
    'pixId',
    'name',
    'practicalTitleFr',
    'practicalTitleEn',
    'practicalDescriptionFr',
    'practicalDescriptionEn',
    'index',
    'competence',
    'theme',
    'rawSkills',
  ],
  transform({
    id,
    airtableId,
    practicalTitle_i18n,
    practicalDescription_i18n,
    thematicAirtableId,
    competenceAirtableId,
    skillAirtableIds,
    ...thematic
  }) {
    return {
      ...thematic,
      id: airtableId,
      pixId: id,
      practicalTitleFr: practicalTitle_i18n.fr,
      practicalTitleEn: practicalTitle_i18n.en,
      practicalDescriptionFr: practicalDescription_i18n.fr,
      practicalDescriptionEn: practicalDescription_i18n.en,
      theme: thematicAirtableId && { id: thematicAirtableId },
      competence: competenceAirtableId && { id: competenceAirtableId },
      rawSkills: skillAirtableIds?.map((id) => ({ id })),
    };
  },
  theme: {
    ref: 'id',
  },
  competence: {
    ref: 'id',
  },
  rawSkills: {
    ref: 'id',
  },
  typeForAttribute(attribute) {
    if (attribute === 'rawSkills') return 'skills';
  },
});

export function serialize(tubes) {
  return serializer.serialize(tubes);
}
