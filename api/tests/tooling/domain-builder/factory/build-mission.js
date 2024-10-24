import { Mission } from '../../../../lib/domain/models/index.js';

export function buildMission({
  id = 3,
  name = 'Ma mission',
  cardImageUrl = null,
  competenceId = 'recCompetence1',
  thematicIds = 'recThematic1',
  createdAt = new Date('2023-10-14'),
  learningObjectives = '- Que tu deviennes forte\n Et...',
  validatedObjectives = '- Ca\n Et puis ça',
  introductionMediaUrl = null,
  introductionMediaType = null,
  introductionMediaAlt = null,
  documentationUrl = null,
  status = Mission.status.VALIDATED,
} = {}) {
  return new Mission ({
    id,
    name_i18n: { fr: name },
    cardImageUrl,
    competenceId,
    thematicIds,
    createdAt,
    learningObjectives_i18n: { fr: learningObjectives },
    validatedObjectives_i18n: { fr: validatedObjectives },
    introductionMediaUrl,
    introductionMediaType,
    introductionMediaAlt_i18n: { fr: introductionMediaAlt },
    documentationUrl,
    status,
  });
}
